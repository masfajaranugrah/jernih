/**
 * K6 Load Testing Configuration
 * Konfigurasi base URL dan environment untuk testing
 */

export const config = {
  // Base URLs
  FRONTEND_URL: __ENV.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: __ENV.BACKEND_URL || 'http://localhost:3001',

  // Test thresholds (95% requests harus sukses dalam waktu yang ditentukan)
  thresholds: {
    // 95% request harus selesai dalam 2 detik
    'http_req_duration': ['p(95)<2000'],
    // 99% request harus sukses (status 200-399)
    'http_req_failed': ['rate<0.01'],
    // Response time average harus < 1 detik
    'http_req_duration{type:homepage}': ['avg<1000'],
    'http_req_duration{type:list}': ['avg<1500'],
    'http_req_duration{type:detail}': ['avg<1200'],
    'http_req_duration{type:api}': ['avg<500'],
  },

  // Scenarios presets
  scenarios: {
    // Load test standar — 10 VU selama 30 detik
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
    // Load test normal — 10 VU selama 2 menit
    load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
    },
    // Stress test — ramp up hingga 50 VU
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
    },
    // Spike test — sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 100 }, // sudden spike
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ],
    },
  },
};

/**
 * Check response validity
 */
export function checkResponse(res, expectedStatus = 200) {
  return res.status === expectedStatus;
}

/**
 * Random sleep untuk simulate user behavior
 */
export function randomSleep(min = 1, max = 3) {
  const { sleep } = require('k6');
  sleep(Math.random() * (max - min) + min);
}
