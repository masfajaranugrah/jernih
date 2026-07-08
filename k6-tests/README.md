# K6 Load Testing Suite

Comprehensive load testing suite untuk **Jernih Creatife Marketplace** menggunakan [K6](https://k6.io/).

## 📁 Struktur Folder

```
k6-tests/
├── frontend/           # Test untuk Next.js frontend pages
│   ├── homepage.test.js
│   ├── produk-list.test.js
│   ├── jasa-sewa.test.js
│   └── detail-pages.test.js
├── backend/            # Test untuk NestJS API endpoints
│   └── api-endpoints.test.js
├── scenarios/          # Stress test & spike test scenarios
│   └── stress-spike.test.js
├── utils/              # Helper functions & config
│   └── config.js
└── README.md           # Dokumentasi ini
```

## 🚀 Quick Start

### 1. Install K6

**MacOS** (Homebrew):
```bash
brew install k6
```

**Linux** (Debian/Ubuntu):
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows** (Chocolatey):
```bash
choco install k6
```

Atau download binary dari: https://k6.io/docs/getting-started/installation/

### 2. Setup Environment

Pastikan aplikasi sudah running:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

## 📊 Test Scenarios

### 1. Homepage Test
Test halaman beranda dengan Suspense streaming (Hero, Promo, Product sections).

```bash
k6 run k6-tests/frontend/homepage.test.js
```

**Expected Performance:**
- P95 < 3 detik
- Success rate > 99%
- 10-20 concurrent users

---

### 2. Produk List Test
Test halaman daftar produk dengan pagination, search, dan filter.

```bash
k6 run k6-tests/frontend/produk-list.test.js
```

**Expected Performance:**
- P95 < 2.5 detik
- Search query < 2 detik

---

### 3. Jasa & Sewa Test
Test halaman jasa dan sewa yang menggunakan server component.

```bash
k6 run k6-tests/frontend/jasa-sewa.test.js
```

**Catatan:** Halaman ini baru direfactor ke server component, harusnya lebih cepat dari sebelumnya.

---

### 4. Detail Pages Test
Test halaman detail produk dan jasa.

```bash
k6 run k6-tests/frontend/detail-pages.test.js
```

**⚠️ Penting:** Update array `productSlugs` dan `jasaSlugs` di file test dengan slug yang benar-benar ada di database kamu untuk menghindari 404.

---

### 5. Backend API Test
Test langsung ke API endpoints (products, services, rentals, hero).

```bash
k6 run k6-tests/backend/api-endpoints.test.js
```

**Expected Performance:**
- P95 < 1 detik
- API response < 500ms avg
- Throughput > 50 req/s

---

### 6. Stress Test
Gradually push system to limits (0 → 200 VUs over 14 minutes).

```bash
k6 run k6-tests/scenarios/stress-spike.test.js
```

atau dengan explicit type:

```bash
TEST_TYPE=stress k6 run k6-tests/scenarios/stress-spike.test.js
```

**Goal:** Find system breaking point dan observe degradation.

---

### 7. Spike Test
Sudden traffic surge (10 → 200 VUs instantly).

```bash
TEST_TYPE=spike k6 run k6-tests/scenarios/stress-spike.test.js
```

**Goal:** Test system behavior under sudden load (flash sale, viral traffic).

---

## 🎛️ Custom Configuration

### Override Base URLs

```bash
FRONTEND_URL=https://staging.example.com \
BACKEND_URL=https://api-staging.example.com \
k6 run k6-tests/frontend/homepage.test.js
```

### Run with Custom Thresholds

Edit file test dan modify `options.thresholds`:

```javascript
export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // Lebih ketat
    'http_req_failed': ['rate<0.001'],   // < 0.1% error
  },
};
```

### Run Smoke Test (Quick Validation)

```bash
k6 run --vus 1 --duration 30s k6-tests/frontend/homepage.test.js
```

### Run with More VUs (Heavy Load)

```bash
k6 run --vus 50 --duration 5m k6-tests/frontend/produk-list.test.js
```

## 📈 Understanding Results

### Key Metrics

| Metric | Description | Good Target |
|--------|-------------|-------------|
| `http_req_duration` | Total request time | P95 < 2000ms |
| `http_req_waiting` | Time to first byte (TTFB) | P95 < 500ms |
| `http_req_receiving` | Response download time | P95 < 100ms |
| `http_req_failed` | Failed requests ratio | < 1% |
| `http_reqs` | Total requests | Higher is better |

### Interpreting P-values

- **P50 (Median)**: 50% requests faster than this
- **P95**: 95% requests faster than this (standard SLA)
- **P99**: 99% requests faster than this (outliers included)

### Example Output

```
✓ Test: Homepage Load Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Requests: 1,234
  Avg Duration: 856.23ms
  P95 Duration: 1,842.56ms
  Failed Rate: 0.16%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Analysis:**
- ✅ P95 < 2 detik → **Bagus**
- ✅ Error rate < 1% → **Excellent**
- ⚠️ Jika P95 > 3 detik → Perlu optimasi

## 🔧 Troubleshooting

### 1. Connection Refused

```
ERRO[0001] GoError: Get "http://localhost:3000": dial tcp [::1]:3000: connect: connection refused
```

**Solution:** Pastikan frontend/backend sudah running:

```bash
# Check ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Restart jika perlu
npm run dev
```

---

### 2. High Error Rate (> 5%)

**Possible Causes:**
- Database connection pool exhausted
- Memory leak di backend
- Rate limiting kicked in
- Network timeout

**Solution:**
- Check backend logs: `docker logs backend` atau `npm run start:dev`
- Increase database pool size
- Add connection retry logic
- Review error patterns in K6 console

---

### 3. Slow Response Times

**Possible Causes:**
- Database query tidak optimal (missing index)
- N+1 query problem
- No caching strategy
- Large payload size

**Solution:**
- Enable query logging di Prisma
- Add database indexes
- Implement Redis cache
- Enable gzip compression
- Use CDN untuk static assets

---

### 4. Test Failures (Threshold Not Met)

```
✗ http_req_duration............: p(95)=3245.67ms (threshold failed: p(95)<2000)
```

**Solution:**
1. Baseline dulu dengan smoke test (1 VU)
2. Cek apakah ini masalah code atau infrastruktur
3. Profile dengan browser DevTools
4. Review database queries
5. Consider horizontal scaling

## 📝 Best Practices

### 1. Always Start with Smoke Test
```bash
k6 run --vus 1 --duration 30s <test-file>
```

### 2. Update Test Data
Ganti slug/ID di test script dengan data real dari database:

```javascript
const productSlugs = [
  'dualsense-edge',  // ✅ Ada di DB
  'ps5-console',     // ✅ Ada di DB
  'fake-product',    // ❌ Akan 404
];
```

### 3. Run Tests in Sequence
```bash
# Progressive load testing
k6 run --vus 1 --duration 1m <test>   # Smoke
k6 run --vus 10 --duration 2m <test>  # Load
k6 run --vus 50 --duration 5m <test>  # Stress
```

### 4. Monitor System Resources
Sambil test running, monitor:
```bash
# CPU & Memory
htop

# Database connections
docker exec -it postgres psql -U user -d eccomarket -c "SELECT count(*) FROM pg_stat_activity;"

# Node.js memory
node --expose-gc --max-old-space-size=4096 app.js
```

### 5. Save Results
```bash
k6 run --out json=results.json k6-tests/frontend/homepage.test.js
```

Analyze dengan: https://github.com/benc-uk/k6-reporter

## 🎯 Performance Targets

| Page Type | Target P95 | Target Success Rate |
|-----------|------------|---------------------|
| Homepage | < 3000ms | > 99% |
| List Pages | < 2500ms | > 99% |
| Detail Pages | < 2500ms | > 99% |
| API Endpoints | < 1000ms | > 99.5% |

## 🔗 Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://github.com/grafana/k6/tree/master/examples)
- [K6 Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [HTTP Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check error logs di backend
2. Review K6 console output
3. Check database slow query logs
4. Monitor Network tab di browser

Happy Load Testing! 🚀
