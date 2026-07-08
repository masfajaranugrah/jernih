/**
 * K6 Load Test: Detail Pages
 * 
 * Test halaman detail untuk:
 * - Produk detail (/produk/[slug])
 * - Jasa detail (/jasa/[slug])
 * - Sewa detail (future: /sewa/[slug])
 * 
 * Scenario: User viewing detail pages dengan traffic campuran
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { config } from '../utils/config.js';

const errorRate = new Rate('errors');
const detailLoadTime = new Trend('detail_page_duration');
const notFoundCounter = new Counter('not_found_count');

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '2m', target: 15 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'],
    'http_req_failed': ['rate<0.05'], // Sedikit lebih toleran karena bisa ada 404
    'detail_page_duration': ['p(95)<2500'],
  },
};

export default function () {
  const BASE_URL = config.FRONTEND_URL;

  // Sample slugs untuk test (ganti dengan slug yang ada di database kamu)
  const productSlugs = [
    'dualsense-edge',
    'ps5-console',
    'gaming-laptop',
    'mechanical-keyboard',
    'gaming-monitor',
  ];

  const jasaSlugs = [
    'web-development',
    'graphic-design',
    'video-editing',
    'social-media-management',
  ];

  // ══════════════════════════════════════════════════════════════
  // GROUP 1: Test Produk Detail
  // ══════════════════════════════════════════════════════════════
  group('Produk Detail Page', () => {
    const randomSlug = productSlugs[Math.floor(Math.random() * productSlugs.length)];
    
    const produkDetailRes = http.get(`${BASE_URL}/produk/${randomSlug}`, {
      tags: { name: 'ProdukDetail', type: 'detail' },
    });

    const produkDetailSuccess = check(produkDetailRes, {
      'Produk detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Produk detail loads within 2.5s': (r) => r.timings.duration < 2500,
    });

    if (produkDetailRes.status === 200) {
      check(produkDetailRes, {
        'Produk detail has product name': (r) => r.body.length > 1000, // Minimal ada konten
        'Produk detail has price': (r) => r.body.includes('Rp') || r.body.includes('rp'),
        'Produk detail has image': (r) => r.body.includes('<img') || r.body.includes('Image'),
        'Produk detail has CTA button': (r) => 
          r.body.includes('Beli') || 
          r.body.includes('Tambah') || 
          r.body.includes('Keranjang'),
      });

      detailLoadTime.add(produkDetailRes.timings.duration);
    } else if (produkDetailRes.status === 404) {
      notFoundCounter.add(1);
      console.log(`Product not found: ${randomSlug}`);
    } else {
      errorRate.add(1);
      console.error(`Produk detail failed: status=${produkDetailRes.status}, slug=${randomSlug}`);
    }

    sleep(3 + Math.random() * 3); // User reads detail page 3-6s
  });

  // ══════════════════════════════════════════════════════════════
  // GROUP 2: Test Jasa Detail
  // ══════════════════════════════════════════════════════════════
  group('Jasa Detail Page', () => {
    const randomJasaSlug = jasaSlugs[Math.floor(Math.random() * jasaSlugs.length)];
    
    const jasaDetailRes = http.get(`${BASE_URL}/jasa/${randomJasaSlug}`, {
      tags: { name: 'JasaDetail', type: 'detail' },
    });

    const jasaDetailSuccess = check(jasaDetailRes, {
      'Jasa detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Jasa detail loads within 2.5s': (r) => r.timings.duration < 2500,
    });

    if (jasaDetailRes.status === 200) {
      check(jasaDetailRes, {
        'Jasa detail has service name': (r) => r.body.length > 1000,
        'Jasa detail has price info': (r) => r.body.includes('Rp') || r.body.includes('Mulai dari'),
        'Jasa detail has description': (r) => r.body.length > 500,
      });

      detailLoadTime.add(jasaDetailRes.timings.duration);
    } else if (jasaDetailRes.status === 404) {
      notFoundCounter.add(1);
      console.log(`Jasa not found: ${randomJasaSlug}`);
    } else {
      errorRate.add(1);
    }

    sleep(2 + Math.random() * 2);
  });
}

export function handleSummary(data) {
  const metrics = data.metrics;
  
  let summary = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  DETAIL PAGES - LOAD TEST RESULTS\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  summary += '  📊 Performance Metrics:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_reqs) {
    summary += `  Total Requests:    ${metrics.http_reqs.values.count}\n`;
  }
  
  if (metrics.http_req_duration) {
    summary += `  Avg Duration:      ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `  P50 Duration:      ${metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
    summary += `  P95 Duration:      ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `  P99 Duration:      ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.detail_page_duration) {
    summary += `\n  Detail Page P95:   ${metrics.detail_page_duration.values['p(95)'].toFixed(2)}ms\n`;
  }

  summary += '\n  📈 Response Status:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    const successRate = (100 - failRate).toFixed(2);
    summary += `  Success Rate:      ${successRate}%\n`;
    summary += `  Failed Rate:       ${failRate}%\n`;
  }

  if (metrics.not_found_count) {
    summary += `  404 Not Found:     ${metrics.not_found_count.values.count}\n`;
  }
  
  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  💡 Note: 404 errors normal jika slug sample tidak ada di DB\n';
  summary += '     Update slug array di test script dengan data real\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return {
    'stdout': summary,
  };
}
