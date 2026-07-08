/**
 * Quick Smoke Test - All Endpoints
 * 
 * Quick validation untuk memastikan semua endpoint bisa diakses.
 * Jalankan ini sebelum test yang lebih berat.
 * 
 * Usage: k6 run k6-tests/smoke-test.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { config } from './utils/config.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    'checks': ['rate>0.95'], // 95% checks harus pass
  },
};

export default function () {
  const FRONTEND = config.FRONTEND_URL;
  const BACKEND = config.BACKEND_URL;

  group('🏠 Frontend Pages', () => {
    check(http.get(FRONTEND), {
      'Homepage accessible': (r) => r.status === 200,
    });

    check(http.get(`${FRONTEND}/produk`), {
      'Produk page accessible': (r) => r.status === 200,
    });

    check(http.get(`${FRONTEND}/jasa`), {
      'Jasa page accessible': (r) => r.status === 200,
    });

    check(http.get(`${FRONTEND}/sewa`), {
      'Sewa page accessible': (r) => r.status === 200,
    });
  });

  group('🔌 Backend API', () => {
    check(http.get(`${BACKEND}/api/products`), {
      'Products API accessible': (r) => r.status === 200,
    });

    check(http.get(`${BACKEND}/api/services`), {
      'Services API accessible': (r) => r.status === 200,
    });

    check(http.get(`${BACKEND}/api/rentals/items`), {
      'Rentals API accessible': (r) => r.status === 200,
    });

    check(http.get(`${BACKEND}/api/hero`), {
      'Hero API accessible': (r) => r.status === 200,
    });
  });
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const checks = metrics.checks;
  
  let summary = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  summary += '  🚀 SMOKE TEST RESULTS\n';
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  if (checks) {
    const passed = checks.values.passes;
    const failed = checks.values.fails;
    const total = passed + failed;
    const passRate = ((passed / total) * 100).toFixed(2);
    
    summary += `  Checks Passed:     ${passed}/${total} (${passRate}%)\n`;
    
    if (passRate >= 95) {
      summary += '\n  Status: ✅ ALL SYSTEMS OPERATIONAL\n';
    } else if (passRate >= 80) {
      summary += '\n  Status: ⚠️  SOME ENDPOINTS FAILING\n';
    } else {
      summary += '\n  Status: ❌ CRITICAL - MULTIPLE FAILURES\n';
    }
  }
  
  summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  if (checks && (checks.values.passes / (checks.values.passes + checks.values.fails)) >= 0.95) {
    summary += '  Ready for load testing! 🎉\n';
  } else {
    summary += '  Fix failing endpoints before load testing!\n';
  }
  
  summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  return {
    'stdout': summary,
  };
}
