/**
 * K6 Load Test: Jasa & Sewa Pages
 * 
 * Test halaman Jasa dan Sewa yang baru direfactor ke server component:
 * - Initial load (server-side render)
 * - Filter interaktif (client-side)
 * - Search functionality
 * 
 * Scenario: User browsing layanan jasa dan katalog sewa
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from '../utils/config.js';

const errorRate = new Rate('errors');
const jasaLoadTime = new Trend('jasa_duration');
const sewaLoadTime = new Trend('sewa_duration');

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2500'],
    'http_req_failed': ['rate<0.01'],
    'jasa_duration': ['p(95)<2000'],
    'sewa_duration': ['p(95)<2000'],
  },
};

export default function () {
  const BASE_URL = config.FRONTEND_URL;

  // ══════════════════════════════════════════════════════════════
  // GROUP 1: Test Jasa Page
  // ══════════════════════════════════════════════════════════════
  group('Jasa Page', () => {
    // Load Jasa list
    const jasaRes = http.get(`${BASE_URL}/jasa`, {
      tags: { name: 'JasaList', type: 'list' },
    });

    const jasaSuccess = check(jasaRes, {
      'Jasa page status is 200': (r) => r.status === 200,
      'Jasa page loads within 2s': (r) => r.timings.duration < 2000,
      'Jasa page has title': (r) => r.body.includes('Layanan') || r.body.includes('Jasa'),
      'Jasa page has filter sidebar': (r) => r.body.includes('Filter') || r.body.includes('Kategori'),
    });

    errorRate.add(!jasaSuccess);
    jasaLoadTime.add(jasaRes.timings.duration);

    if (!jasaSuccess) {
      console.error(`Jasa page failed: status=${jasaRes.status}, duration=${jasaRes.timings.duration}ms`);
    }

    sleep(2 + Math.random() * 2);

    // Test Jasa search
    const jasaSearchQueries = ['design', 'konstruksi', 'digital', 'web'];
    const randomJasaQuery = jasaSearchQueries[Math.floor(Math.random() * jasaSearchQueries.length)];
    
    const jasaSearchRes = http.get(`${BASE_URL}/jasa?search=${randomJasaQuery}`, {
      tags: { name: 'JasaSearch', type: 'list' },
    });

    check(jasaSearchRes, {
      'Jasa search loads': (r) => r.status === 200,
      'Jasa search within 2s': (r) => r.timings.duration < 2000,
    });

    sleep(1 + Math.random());
  });

  // ══════════════════════════════════════════════════════════════
  // GROUP 2: Test Sewa Page
  // ══════════════════════════════════════════════════════════════
  group('Sewa Page', () => {
    // Load Sewa list
    const sewaRes = http.get(`${BASE_URL}/sewa`, {
      tags: { name: 'SewaList', type: 'list' },
    });

    const sewaSuccess = check(sewaRes, {
      'Sewa page status is 200': (r) => r.status === 200,
      'Sewa page loads within 2s': (r) => r.timings.duration < 2000,
      'Sewa page has title': (r) => r.body.includes('Sewa') || r.body.includes('Katalog'),
      'Sewa page has filter': (r) => r.body.includes('Filter'),
    });

    errorRate.add(!sewaSuccess);
    sewaLoadTime.add(sewaRes.timings.duration);

    if (!sewaSuccess) {
      console.error(`Sewa page failed: status=${sewaRes.status}`);
    }

    sleep(2 + Math.random() * 2);

    // Test Sewa search
    const sewaSearchQueries = ['kamera', 'sound', 'lighting', 'equipment'];
    const randomSewaQuery = sewaSearchQueries[Math.floor(Math.random() * sewaSearchQueries.length)];
    
    const sewaSearchRes = http.get(`${BASE_URL}/sewa?search=${randomSewaQuery}`, {
      tags: { name: 'SewaSearch', type: 'list' },
    });

    check(sewaSearchRes, {
      'Sewa search loads': (r) => r.status === 200,
      'Sewa search within 2s': (r) => r.timings.duration < 2000,
    });

    sleep(1);
  });
}

export function handleSummary(data) {
  const metrics = data.metrics;
  
  let summary = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  JASA & SEWA PAGES - LOAD TEST RESULTS\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  summary += '  📊 Overall Metrics:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.http_reqs) {
    summary += `  Total Requests:    ${metrics.http_reqs.values.count}\n`;
  }
  
  if (metrics.http_req_duration) {
    summary += `  Avg Duration:      ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `  P95 Duration:      ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.http_req_failed) {
    const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `  Failed Rate:       ${failRate}%\n`;
  }

  summary += '\n  🎯 Page-Specific Metrics:\n';
  summary += '  ────────────────────────────────────────\n';
  
  if (metrics.jasa_duration) {
    summary += `  Jasa P95:          ${metrics.jasa_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  if (metrics.sewa_duration) {
    summary += `  Sewa P95:          ${metrics.sewa_duration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return {
    'stdout': summary,
  };
}
