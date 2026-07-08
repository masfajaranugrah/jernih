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
    { duration: '30s', target: 10 },  // Ramp up ke 10 users
    { duration: '1m', target: 10 },   // Maintain 10 users
    { duration: '30s', target: 20 },  // Ramp up ke 20 users
    { duration: '1m', target: 20 },   // Maintain 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'], // 95% requests < 3s
    'http_req_failed': ['rate<0.01'],    // Error rate < 1%
    'errors': ['rate<0.1'],              // Custom error rate < 10%
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
  const enableColors = options?.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}✓ Test: Homepage Load Test\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const metrics = data.metrics;
  
  if (metrics.http_reqs) {
    summary += `${indent}  Total Requests: ${metrics.http_reqs.values.count}\n`;
  }
  
  if (metrics.http_req_duration) {
    summary += `${indent}  Avg Duration: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  P95 Duration: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}  Failed Rate: ${failRate}%\n`;
  }
  
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  return summary;
}
