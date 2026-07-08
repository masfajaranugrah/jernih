/**
 * K6 Load Test: Produk List Page
 * 
 * Test halaman daftar produk dengan:
 * - Grid produk (default load)
 * - Filter by category
 * - Search functionality
 * - Pagination/infinite scroll
 * 
 * Scenario: User browsing product catalog dengan berbagai filter
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from '../utils/config.js';

// Custom metrics
const errorRate = new Rate('errors');
const productLoadTime = new Trend('product_page_duration');

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '2m', target: 15 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2500'],
    'http_req_failed': ['rate<0.01'],
    'product_page_duration': ['p(95)<2000'],
  },
};

export default function () {
  const BASE_URL = config.FRONTEND_URL;

  // ── Test 1: Load Produk List (default) ──────────────────────
  const produkRes = http.get(`${BASE_URL}/produk`, {
    tags: { name: 'ProdukList', type: 'list' },
  });

  const produkSuccess = check(produkRes, {
    'Produk page status is 200': (r) => r.status === 200,
    'Produk page loads within 2.5s': (r) => r.timings.duration < 2500,
    'Produk page has products': (r) => r.body.includes('Produk') || r.body.includes('produk'),
    'Produk page has filter': (r) => r.body.includes('Filter') || r.body.includes('Kategori'),
  });

  errorRate.add(!produkSuccess);
  productLoadTime.add(produkRes.timings.duration);

  if (!produkSuccess) {
    console.error(`Produk list failed: status=${produkRes.status}`);
  }

  sleep(2 + Math.random() * 2);

  // ── Test 2: Search products ──────────────────────────────────
  const searchQueries = ['ps5', 'gaming', 'console', 'laptop', 'monitor'];
  const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  const searchRes = http.get(`${BASE_URL}/produk?search=${randomQuery}`, {
    tags: { name: 'ProdukSearch', type: 'list' },
  });

  check(searchRes, {
    'Search results load': (r) => r.status === 200,
    'Search results within 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1 + Math.random());

  // ── Test 3: Filter by category (simulate) ────────────────────
  // Note: Karena filter di client-side, kita test initial load dengan kategori
  const categoryRes = http.get(`${BASE_URL}/produk`, {
    tags: { name: 'ProdukCategory', type: 'list' },
  });

  check(categoryRes, {
    'Category filter page loads': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  
  let summary = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  PRODUK LIST PAGE - LOAD TEST RESULTS\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  if (metrics.http_reqs) {
    summary += `  Total Requests:    ${metrics.http_reqs.values.count}\n`;
  }
  
  if (metrics.http_req_duration) {
    summary += `  Avg Duration:      ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `  Min Duration:      ${metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `  Max Duration:      ${metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `  P50 Duration:      ${metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
    summary += `  P95 Duration:      ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `  P99 Duration:      ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    const passRate = (100 - failRate).toFixed(2);
    summary += `\n  Success Rate:      ${passRate}%\n`;
    summary += `  Failed Rate:       ${failRate}%\n`;
  }

  if (metrics.product_page_duration) {
    summary += `\n  Product Page P95:  ${metrics.product_page_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return {
    'stdout': summary,
  };
}
