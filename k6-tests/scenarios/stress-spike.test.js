/**
 * K6 Stress & Spike Test Scenarios
 * 
 * STRESS TEST:
 * - Gradually increase load beyond normal capacity
 * - Find breaking point of the system
 * - Test recovery behavior
 * 
 * SPIKE TEST:
 * - Sudden surge in traffic (10x normal)
 * - Test system behavior under sudden load
 * - Simulate viral traffic or flash sales
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { config } from '../utils/config.js';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const successCounter = new Counter('success_count');
const failCounter = new Counter('fail_count');

// ══════════════════════════════════════════════════════════════
// STRESS TEST - Gradually push system to limits
// ══════════════════════════════════════════════════════════════
export const stressTestOptions = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },   // Normal load
        { duration: '2m', target: 50 },   // Above normal
        { duration: '2m', target: 100 },  // High load
        { duration: '2m', target: 150 },  // Very high load
        { duration: '2m', target: 200 },  // Extreme load
        { duration: '3m', target: 200 },  // Sustain extreme
        { duration: '2m', target: 0 },    // Recovery
      ],
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Relax threshold untuk stress test
    'http_req_failed': ['rate<0.1'],     // Allow 10% failure
    'response_time': ['p(99)<10000'],
  },
};

// ══════════════════════════════════════════════════════════════
// SPIKE TEST - Sudden traffic surge
// ══════════════════════════════════════════════════════════════
export const spikeTestOptions = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // Normal baseline
        { duration: '10s', target: 200 },  // 🚀 SUDDEN SPIKE!
        { duration: '1m', target: 200 },   // Sustain spike
        { duration: '10s', target: 10 },   // Drop back
        { duration: '30s', target: 10 },   // Recovery period
        { duration: '10s', target: 0 },    // Cool down
      ],
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<8000'],
    'http_req_failed': ['rate<0.15'], // Allow 15% failure during spike
  },
};

// Choose which test to run based on environment variable
// Usage: TEST_TYPE=spike k6 run stress-spike.test.js
const TEST_TYPE = __ENV.TEST_TYPE || 'stress';
export const options = TEST_TYPE === 'spike' ? spikeTestOptions : stressTestOptions;

export default function () {
  const BASE_URL = config.FRONTEND_URL;
  const API_URL = config.BACKEND_URL;

  // Mix of different requests to simulate real traffic
  const endpoints = [
    { url: BASE_URL, name: 'Homepage', weight: 40 },
    { url: `${BASE_URL}/produk`, name: 'Products', weight: 30 },
    { url: `${BASE_URL}/jasa`, name: 'Services', weight: 15 },
    { url: `${BASE_URL}/sewa`, name: 'Rentals', weight: 10 },
    { url: `${API_URL}/api/products`, name: 'API-Products', weight: 5 },
  ];

  // Weighted random selection
  const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  const random = Math.random() * totalWeight;
  let sum = 0;
  let selectedEndpoint = endpoints[0];

  for (const endpoint of endpoints) {
    sum += endpoint.weight;
    if (random <= sum) {
      selectedEndpoint = endpoint;
      break;
    }
  }

  // Make request
  const res = http.get(selectedEndpoint.url, {
    tags: { 
      name: selectedEndpoint.name,
      test_type: TEST_TYPE,
    },
    timeout: '10s', // 10 detik timeout untuk stress test
  });

  const success = check(res, {
    'Status is 2xx or 3xx': (r) => r.status >= 200 && r.status < 400,
    'Response within 10s': (r) => r.timings.duration < 10000,
  });

  if (success) {
    successCounter.add(1);
  } else {
    failCounter.add(1);
    errorRate.add(1);
    console.error(`Failed request to ${selectedEndpoint.name}: status=${res.status}, duration=${res.timings.duration}ms`);
  }

  responseTime.add(res.timings.duration);

  // Vary sleep time based on test type
  if (TEST_TYPE === 'spike') {
    sleep(0.1 + Math.random() * 0.5); // Shorter sleep for spike
  } else {
    sleep(0.5 + Math.random() * 1.5); // Normal sleep for stress
  }
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const testType = TEST_TYPE === 'spike' ? 'SPIKE TEST' : 'STRESS TEST';
  
  let summary = '\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += `  ${testType} RESULTS\n`;
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  summary += '  🎯 Test Configuration:\n';
  summary += '  ────────────────────────────────────────\n';
  summary += `  Test Type:         ${testType}\n`;
  summary += `  Total Duration:    ${(data.state.testRunDurationMs / 1000).toFixed(0)}s\n`;
  
  if (TEST_TYPE === 'stress') {
    summary += '  Max VUs:           200 (gradual ramp)\n';
  } else {
    summary += '  Spike VUs:         10 → 200 (sudden)\n';
  }

  summary += '\n  📊 Request Statistics:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_reqs) {
    const totalReqs = metrics.http_reqs.values.count;
    const duration = data.state.testRunDurationMs / 1000;
    const rps = (totalReqs / duration).toFixed(2);
    
    summary += `  Total Requests:    ${totalReqs}\n`;
    summary += `  Requests/sec:      ${rps} req/s\n`;
  }

  if (metrics.success_count && metrics.fail_count) {
    const successes = metrics.success_count.values.count;
    const failures = metrics.fail_count.values.count;
    const total = successes + failures;
    const successRate = ((successes / total) * 100).toFixed(2);
    
    summary += `  Successful:        ${successes} (${successRate}%)\n`;
    summary += `  Failed:            ${failures} (${(100 - successRate).toFixed(2)}%)\n`;
  }

  summary += '\n  ⚡ Response Times:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_req_duration) {
    summary += `  Min:               ${metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `  Avg:               ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `  Med:               ${metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
    summary += `  Max:               ${metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `  P90:               ${metrics.http_req_duration.values['p(90)'].toFixed(2)}ms\n`;
    summary += `  P95:               ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `  P99:               ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }

  summary += '\n  🔍 System Behavior Analysis:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    const p99 = metrics.http_req_duration.values['p(99)'];
    const avg = metrics.http_req_duration.values.avg;
    
    // Assess degradation
    if (p95 < 2000) {
      summary += '  P95 Performance:   ✅ Excellent\n';
    } else if (p95 < 5000) {
      summary += '  P95 Performance:   ⚠️  Degraded\n';
    } else {
      summary += '  P95 Performance:   ❌ Severely Degraded\n';
    }

    // Assess stability
    const variance = p99 - avg;
    if (variance < 2000) {
      summary += '  Stability:         ✅ Stable\n';
    } else if (variance < 5000) {
      summary += '  Stability:         ⚠️  Moderate Variance\n';
    } else {
      summary += '  Stability:         ❌ High Variance\n';
    }
  }

  if (metrics.http_req_failed) {
    const failRate = metrics.http_req_failed.values.rate * 100;
    
    if (failRate < 1) {
      summary += '  Error Rate:        ✅ Excellent (< 1%)\n';
    } else if (failRate < 5) {
      summary += `  Error Rate:        ⚠️  Acceptable (${failRate.toFixed(2)}%)\n`;
    } else if (failRate < 15) {
      summary += `  Error Rate:        ⚠️  High (${failRate.toFixed(2)}%)\n`;
    } else {
      summary += `  Error Rate:        ❌ Critical (${failRate.toFixed(2)}%)\n`;
    }
  }

  summary += '\n  💡 Recommendations:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_req_duration && metrics.http_req_failed) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    const failRate = metrics.http_req_failed.values.rate * 100;
    
    if (p95 > 5000) {
      summary += '  • Consider caching strategy\n';
      summary += '  • Optimize database queries\n';
      summary += '  • Add CDN for static assets\n';
    }
    
    if (failRate > 5) {
      summary += '  • Implement rate limiting\n';
      summary += '  • Add auto-scaling rules\n';
      summary += '  • Review error logs for patterns\n';
    }
    
    if (p95 < 2000 && failRate < 1) {
      summary += '  • System performing excellently! ✅\n';
      summary += '  • Consider testing higher loads\n';
    }
  }

  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return {
    'stdout': summary,
  };
}
