/**
 * K6 Load Test: Homepage
 * 
 * Test homepage dengan Suspense streaming:
 * - Hero section (bento grid)
 * - Promo section
 * - Product section (3 sections: Produk, Jasa, Sewa)
 * 
 * Scenario: Simulate user browsing homepage dengan traffic normal
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { config } from '../utils/config.js';

// Custom metrics
const errorRate = new Rate('errors');
const homepageLoadTime = new Rate('homepage_load_time');

export const options = {
  stages: [
    // Warm up
    { duration: '1m', target: 50 },     // Ramp up ke 50 users (traffic awal)
    { duration: '3m', target: 50 },     // Sustain 50 users (baseline traffic)
    
    // Peak hours simulation
    { duration: '1m', target: 150 },    // Ramp up ke 150 users (jam sibuk)
    { duration: '5m', target: 150 },    // Sustain peak traffic
    
    // Viral spike / marketing campaign
    { duration: '30s', target: 300 },   // Sudden spike (promo/viral)
    { duration: '2m', target: 300 },    // Sustain spike
    
    // Cooldown to peak
    { duration: '1m', target: 150 },    // Back to peak
    { duration: '2m', target: 150 },    // Maintain
    
    // Return to normal
    { duration: '1m', target: 50 },     // Back to baseline
    { duration: '2m', target: 50 },     // Cooldown
    
    // Ramp down
    { duration: '1m', target: 0 },      // Graceful shutdown
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],   // Tighten: 95% requests < 500ms
    'http_req_duration': ['p(99)<1000'],  // 99% requests < 1s
    'http_req_failed': ['rate<0.01'],     // Error rate < 1%
    'errors': ['rate<0.05'],              // Custom error rate < 5% (more strict)
  },
};

export default function () {
  const BASE_URL = config.FRONTEND_URL;

  // ── Test 1: Load Homepage ────────────────────────────────────
  const homepageRes = http.get(BASE_URL, {
    tags: { name: 'Homepage', type: 'homepage' },
  });

  const homepageSuccess = check(homepageRes, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loads within 3s': (r) => r.timings.duration < 3000,
    'Homepage has Hero section': (r) => r.body.includes('Jernih Creatife'),
    'Homepage has navigation': (r) => r.body.includes('Produk') && r.body.includes('Jasa'),
  });

  errorRate.add(!homepageSuccess);

  if (!homepageSuccess) {
    console.error(`Homepage failed: status=${homepageRes.status}, duration=${homepageRes.timings.duration}ms`);
  }

  // Simulate user reading homepage content
  sleep(2 + Math.random() * 3); // 2-5 seconds

  // ── Test 2: Check static assets load ────────────────────────
  const params = {
    headers: {
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    },
    tags: { name: 'StaticAssets', type: 'assets' },
  };

  // Check favicon
  const faviconRes = http.get(`${BASE_URL}/favicon.ico`, params);
  check(faviconRes, {
    'Favicon loads': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  
  let summary = '\n';
  summary += `${indent}✓ Test: Homepage Load Test (Production-Grade)\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const metrics = data.metrics;
  
  // Request volume
  if (metrics.http_reqs) {
    const rps = metrics.http_reqs.values.rate.toFixed(2);
    summary += `${indent}  Total Requests : ${metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Req/s          : ${rps} req/s\n`;
  }
  
  // Response times
  if (metrics.http_req_duration) {
    const d = metrics.http_req_duration.values;
    summary += `${indent}  ─── Response Time ───────────────────────\n`;
    summary += `${indent}  Avg            : ${d.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Min            : ${d.min.toFixed(2)}ms\n`;
    summary += `${indent}  Median (P50)   : ${d.med.toFixed(2)}ms\n`;
    summary += `${indent}  P90            : ${d['p(90)'].toFixed(2)}ms\n`;
    summary += `${indent}  P95            : ${d['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  P99            : ${d['p(99)'].toFixed(2)}ms\n`;
    summary += `${indent}  Max            : ${d.max.toFixed(2)}ms\n`;
  }
  
  // Error rates
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    const status = failRate < 1 ? '✓' : '✗';
    summary += `${indent}  ─── Reliability ─────────────────────────\n`;
    summary += `${indent}  ${status} Failed Rate   : ${failRate}%\n`;
  }

  if (metrics.errors) {
    const errRate = (metrics.errors.values.rate * 100).toFixed(2);
    const status = errRate < 5 ? '✓' : '✗';
    summary += `${indent}  ${status} Custom Errors : ${errRate}%\n`;
  }

  // Network
  if (metrics.data_received && metrics.data_sent) {
    const recv = (metrics.data_received.values.count / 1024 / 1024).toFixed(2);
    const sent = (metrics.data_sent.values.count / 1024 / 1024).toFixed(2);
    summary += `${indent}  ─── Network ─────────────────────────────\n`;
    summary += `${indent}  Data Received  : ${recv} MB\n`;
    summary += `${indent}  Data Sent      : ${sent} MB\n`;
  }
  
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  return summary;
}
