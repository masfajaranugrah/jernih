/**
 * K6 Load Test: Backend API Endpoints
 * 
 * Test direct API calls ke NestJS backend:
 * - GET /api/products
 * - GET /api/products/:id
 * - GET /api/services
 * - GET /api/rentals/items
 * - GET /api/hero
 * 
 * Scenario: High throughput API load test
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from '../utils/config.js';

const apiErrorRate = new Rate('api_errors');
const apiResponseTime = new Trend('api_response_time');

export const options = {
  stages: [
    { duration: '20s', target: 20 },  // Warm up
    { duration: '1m', target: 50 },   // Normal load
    { duration: '30s', target: 100 }, // Peak load
    { duration: '1m', target: 100 },  // Sustained peak
    { duration: '20s', target: 0 },   // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // API harus lebih cepat dari frontend
    'http_req_failed': ['rate<0.01'],
    'api_response_time': ['p(95)<800'],
  },
};

export default function () {
  const BASE_URL = config.BACKEND_URL;
  const headers = {
    'Content-Type': 'application/json',
  };

  // ══════════════════════════════════════════════════════════════
  // GROUP 1: Products API
  // ══════════════════════════════════════════════════════════════
  group('Products API', () => {
    // Get all products
    const productsRes = http.get(`${BASE_URL}/api/products`, {
      headers,
      tags: { name: 'GetProducts', type: 'api' },
    });

    const productsSuccess = check(productsRes, {
      'Products API status is 200': (r) => r.status === 200,
      'Products API responds within 500ms': (r) => r.timings.duration < 500,
      'Products API returns data array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch {
          return false;
        }
      },
      'Products API has pagination meta': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.meta && body.meta.total !== undefined;
        } catch {
          return false;
        }
      },
    });

    apiErrorRate.add(!productsSuccess);
    apiResponseTime.add(productsRes.timings.duration);

    sleep(0.5);

    // Get products with search
    const searchRes = http.get(`${BASE_URL}/api/products?search=gaming&limit=20`, {
      headers,
      tags: { name: 'SearchProducts', type: 'api' },
    });

    check(searchRes, {
      'Search API status is 200': (r) => r.status === 200,
      'Search API responds within 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.3);
  });

  // ══════════════════════════════════════════════════════════════
  // GROUP 2: Services API
  // ══════════════════════════════════════════════════════════════
  group('Services API', () => {
    const servicesRes = http.get(`${BASE_URL}/api/services`, {
      headers,
      tags: { name: 'GetServices', type: 'api' },
    });

    const servicesSuccess = check(servicesRes, {
      'Services API status is 200': (r) => r.status === 200,
      'Services API responds within 500ms': (r) => r.timings.duration < 500,
      'Services API returns array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    apiErrorRate.add(!servicesSuccess);
    apiResponseTime.add(servicesRes.timings.duration);

    sleep(0.5);
  });

  // ══════════════════════════════════════════════════════════════
  // GROUP 3: Rentals API
  // ══════════════════════════════════════════════════════════════
  group('Rentals API', () => {
    const rentalsRes = http.get(`${BASE_URL}/api/rentals/items`, {
      headers,
      tags: { name: 'GetRentals', type: 'api' },
    });

    const rentalsSuccess = check(rentalsRes, {
      'Rentals API status is 200': (r) => r.status === 200,
      'Rentals API responds within 500ms': (r) => r.timings.duration < 500,
      'Rentals API returns array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    apiErrorRate.add(!rentalsSuccess);
    apiResponseTime.add(rentalsRes.timings.duration);

    sleep(0.5);
  });

  // ══════════════════════════════════════════════════════════════
  // GROUP 4: Hero API
  // ══════════════════════════════════════════════════════════════
  group('Hero API', () => {
    const heroRes = http.get(`${BASE_URL}/api/hero`, {
      headers,
      tags: { name: 'GetHero', type: 'api' },
    });

    const heroSuccess = check(heroRes, {
      'Hero API status is 200': (r) => r.status === 200,
      'Hero API responds within 300ms': (r) => r.timings.duration < 300,
      'Hero API returns valid structure': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.main && Array.isArray(body.banners);
        } catch {
          return false;
        }
      },
    });

    apiErrorRate.add(!heroSuccess);
    apiResponseTime.add(heroRes.timings.duration);

    sleep(0.3);
  });
}

export function handleSummary(data) {
  const metrics = data.metrics;
  
  let summary = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  BACKEND API - LOAD TEST RESULTS\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  summary += '  🚀 Request Stats:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_reqs) {
    const totalReqs = metrics.http_reqs.values.count;
    const duration = data.state.testRunDurationMs / 1000;
    const rps = (totalReqs / duration).toFixed(2);
    
    summary += `  Total Requests:    ${totalReqs}\n`;
    summary += `  Requests/sec:      ${rps} req/s\n`;
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
  
  if (metrics.api_response_time) {
    summary += `\n  API P95:           ${metrics.api_response_time.values['p(95)'].toFixed(2)}ms\n`;
  }

  summary += '\n  ✅ Success Rate:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    const successRate = (100 - failRate).toFixed(2);
    summary += `  Success:           ${successRate}%\n`;
    summary += `  Failed:            ${failRate}%\n`;
  }
  
  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  // Performance assessment
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    summary += '\n  📊 Performance Assessment:\n';
    summary += '  ────────────────────────────────────────\n';
    
    if (p95 < 500) {
      summary += '  Status: ✅ EXCELLENT (P95 < 500ms)\n';
    } else if (p95 < 1000) {
      summary += '  Status: ✅ GOOD (P95 < 1000ms)\n';
    } else if (p95 < 2000) {
      summary += '  Status: ⚠️  ACCEPTABLE (P95 < 2000ms)\n';
    } else {
      summary += '  Status: ❌ NEEDS OPTIMIZATION (P95 > 2000ms)\n';
    }
    
    summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  }
  
  return {
    'stdout': summary,
  };
}
