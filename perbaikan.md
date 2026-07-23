# Eccomarket — Security Audit Report

> **Tanggal:** 22 Juli 2026
> **Auditor:** Claude Code (QA & Security)
> **Total Temuan:** 49 (5 Critical, 8 High, 18 Medium, 14 Low, 7 Info)

---

## 🔴 CRITICAL (Perbaiki Segera)

### C-1: Registrasi Bisa Pilih Role ADMIN/MITRA ✅
- **File:** `backend/src/auth/dto/auth.dto.ts` + `backend/src/auth/auth.service.ts:41`
- **Perbaikan:** Field `role` dihapus dari `RegisterDto`. Service sekarang hardcode `role: 'CUSTOMER'`.
- **Status:** ✅ **Fixed** — `forbidNonWhitelisted` akan reject request yang contain `role` field

### C-2: Proxy Middleware Tidak Aktif (Dead Code) ✅
- **File:** `src/proxy.ts` → `src/middleware.ts`
- **Perbaikan:** File `src/middleware.ts` dibuat yang re-export proxy.ts sebagai Next.js middleware.
- **Status:** ✅ **Fixed** — Route admin & customer dashboard sekarang terproteksi otomatis

### C-3: Categories CRUD Missing ADMIN Role Guard ✅
- **File:** `backend/src/categories/categories.controller.ts`
- **Perbaikan:** Ditambah `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`.
- **Status:** ✅ **Fixed** — Hanya ADMIN yang bisa create/update/delete kategori

### C-4: Upload BFF Tidak Forward Auth Token
- **File:** `src/app/api/upload/route.ts:19`
- **Masalah:** BFF panggil backend tanpa header `Authorization`.
- **Dampak:** Upload selalu error 401 dari backend.

### C-5: Non-HttpOnly Cookie untuk Client-Side API ✅
- **File:** `src/lib/auth.ts`, 15+ admin pages updated
- **Perbaikan:** 
  - Buat BFF proxy `/api/admin/proxy/[...path]` — baca HttpOnly cookie server-side
  - Buat helper `lib/admin-api.ts` — admin pages pake ini untuk API call
  - Hapus `setToken()` dari 2 halaman login admin — stop non-HttpOnly cookie
  - Update server actions (`hero-actions.ts`) — baca cookie langsung server-side
  - Update 10+ admin pages — ganti `getToken()` + direct API → `adminApi()`
- **Sisa:** WebSocket masih perlu token untuk socket handshake (tidak bisa lewat BFF)
- **Status:** ✅ **Fixed** — API call admin aman via BFF proxy. WebSocket token tetap perlu raw JWT.

---

## 🟡 HIGH

### H-1: Admin Dashboard Bypass BFF Layer
- **File:** 20+ file di `src/app/dashboard-admin/*`
- **Masalah:** Panggil backend langsung via `NEXT_PUBLIC_API_URL` + `getToken()`, tidak lewat BFF routes.
- **Dampak:** BFF sebagai security boundary jadi tidak berguna.

### H-2: No Security Headers (CSP/Helmet)
- **File:** `next.config.ts:20-32` + `backend/src/main.ts`
- **Masalah:** Tidak ada Content-Security-Policy, HSTS, X-Frame-Options.
- **Dampak:** Rentan clickjacking, XSS, MIME-sniffing.

### H-3: No Rate Limiting
- **File:** Global — tidak ada throttler middleware
- **Masalah:** Login bisa brute-force, upload bisa disk-fill DOS, registrasi bisa spam.
- **Perbaikan:** Tambah `@nestjs/throttler` atau middleware rate limit.

### H-4: Chat System-Message Bisa Dikirim Siapa Pun
- **File:** `backend/src/chat/chat.controller.ts:28-31`
- **Masalah:** `POST /chat/system-message` hanya `JwtAuthGuard` tanpa `RolesGuard`.
- **Dampak:** User biasa bisa kirim system message palsu (phishing).

### H-5: Open Redirect via `from` Parameter
- **File:** `src/app/dashboard-admin/auth/login/page.tsx:12`, `admin/login/page.tsx`
- **Masalah:** `searchParams.get("from")` langsung dipakai redirect tanpa validasi.
- **Dampak:** `?from=https://evil.com` bisa dipakai phishing.

### H-6: No CSRF Protection
- **File:** Global — tidak ada CSRF token
- **Masalah:** Cookie `SameSite=Lax` saja tidak cukup. Tidak ada anti-CSRF.
- **Dampak:** Rentan CSRF attack.

### H-7: Backend Error Details Bocor ke Client
- **File:** Semua BFF routes (pattern `return NextResponse.json(data, { status: res.status })`)
- **Masalah:** Raw backend error response langsung diteruskan ke browser.
- **Dampak:** Stack trace, SQL error, internal IP bisa bocor.

### H-8: Seed File Cetak Credential ke Console
- **File:** `backend/prisma/seed.ts:146-147`
- **Masalah:** `console.log('Admin login: admin@jernihcreative.id / admin123')`
- **Dampak:** Credential muncul di log, CI/CD, terminal buffer.

---

## 🟡 MEDIUM

| # | Finding | File | Detail |
|---|---------|------|--------|
| M-1 | Voucher validate TOCTOU race condition | `vouchers.service.ts:47-85` | Quota bisa over-consumption tanpa `SELECT FOR UPDATE` |
| M-2 | Rental date validation — negative price | `rentals.service.ts:18-22` | `endDate < startDate` = negative `totalPrice` |
| M-3 | Settings GET endpoint publik | `settings.controller.ts:12-14` | Siapa pun bisa baca system settings |
| M-4 | No refresh token / token rotation | `auth.service.ts` | JWT 7 hari tidak bisa di-revoke |
| M-5 | Upload filename pakai `Math.random()` | `upload.controller.ts:55` | Bisa diprediksi — pakai `crypto.randomUUID()` |
| M-6 | Categories & Voucher endpoints tanpa DTO | Various | Plain TypeScript type, runtime no validation |
| M-7 | WebSocket reconnect forever with stale token | `chatSocket.ts:6-18` | `reconnectionAttempts: Infinity` |
| M-8 | Logout tidak invalidate token server-side | `lib/auth.ts:32-39` | JWT tetap valid 7 hari setelah logout |
| M-9 | Mass assignment via BFF layer | `api/*/route.ts` | Body diforward mentah tanpa whitelist |
| M-10 | WebSocket cookie fallback XSS-to-WebSocket | `chat.gateway.ts:47-58` | Non-HttpOnly cookie dibaca gateway |
| M-11 | Chat DTO message tanpa @IsOptional | `send-message.dto.ts:7` | Error jika hanya kirim attachment |
| M-12 | Ticket message DTO tanpa @IsNotEmpty | `send-ticket-message.dto.ts` | Empty string bisa disimpan |
| M-13 | Settings save `body: any` tanpa validasi | `settings.controller.ts:21` | Semua tipe data diterima |
| M-14 | Wishlist @Body('productId') tanpa validasi | `wishlist.controller.ts:18` | Null/empty pass through |
| M-15 | OrderNumber pakai Math.random() | `orders.service.ts:94-97` | Bisa diprediksi |
| M-16 | User online-status bisa di-enumerate | `chat.gateway.ts:121-157` | Cek admin online kapan saja |
| M-17 | BFF routes missing try/catch JSON parse | `tickets/route.ts:37` | Malformed JSON → unhandled exception |
| M-18 | SameSite cookie bisa "strict" | `login/route.ts:49` | Admin dashboard lebih aman "strict" |

---

## 🟢 LOW

| # | Finding | Detail |
|---|---------|--------|
| L-1 | Background image hardcoded Google URL | Privacy leak via Google |
| L-2 | `/api/upload` BFF return `detail: errText` | Error detail backend bocor |
| L-3 | No proper TypeScript strict mode | `strict: false` di tsconfig backend |
| L-4 | `PUBLIC_ROUTES` pakai `includes()` bukan `startsWith()` | Bisa match unintended paths |
| L-5 | `UpdateHeroBannerDto` — `align` tanpa `@IsIn()` | Any string accepted |
| L-6 | Semua field `OrderItemDto` optional | Order bisa tanpa item valid |
| L-7 | Chat URL field `require_tld: false` | URL tanpa TLD accepted |
| L-8 | Upload file size window 10-25MB | Temporary disk-write amplification |
| L-9 | User ID enumeration via `/chat/admin-id` | Admin info bocor |
| L-10 | Empty productId/serviceId bypass inventory check | Order tanpa referential integrity |
| L-11 | Orders controller leak conflict details | Existing status bocor di 409 response |

---

## ✅ SUDAH DIFIX

| # | Finding | File | Status |
|---|---------|------|--------|
| 1 | **C-1: Registrasi bisa pilih role ADMIN** | `auth.dto.ts`, `auth.service.ts` | ✅ Role dihapus + hardcode `'CUSTOMER'` |
| 2 | **C-2: Middleware proxy aktif** | `proxy.ts` | ✅ Next.js 16 auto-detect proxy.ts |
| 3 | **C-3: Categories missing RolesGuard** | `categories.controller.ts` | ✅ Ditambah `@Roles('ADMIN')` |
| 4 | **C-4: Upload BFF auth** | `api/upload/route.ts` | ✅ Forward token ke backend |
| 5 | **C-5: Non-HttpOnly cookie** | `lib/auth.ts`, 15+ admin pages | ✅ BFF proxy + adminApi helper |
| 6 | Demo mode login (fake JWT) | `auth/login/page.tsx` (2 files) | ✅ Pakai BFF login + setToken |
| 7 | sendBotMessage tanpa RolesGuard | `orders.controller.ts` | ✅ Ditambah `@Roles('ADMIN')` |
| 8 | Stock tidak berkurang saat order | `orders.service.ts` | ✅ Atomic decrement + transaction |
| 9 | **H-4: Chat system-message guard** | `chat.controller.ts` | ✅ Ditambah `@Roles('ADMIN')` |
| 10 | **H-5: Open redirect di login** | `login/page.tsx` (2 files) | ✅ Validasi `from` hanya path internal |
| 11 | **H-6: CSRF protection** | `common/middleware/csrf-origin.middleware.ts` | ✅ Origin header validation |

---

## 🎯 TOP 10 PRIORITAS PERBAIKAN

| Rank | Finding | File | Estimasi |
|------|---------|------|----------|
| 1 | H-4: Chat system-message missing guard | `chat.controller.ts` | ⏱ 5 menit |
| 2 | H-5: Open redirect di login | `login/page.tsx` | ⏱ 5 menit |
| 3 | H-6: No CSRF protection | Global | ⏱ 5 menit |
| 4 | H-3: Add rate limiting | Global | ⏱ 30 menit |
| 5 | H-2: Add security headers CSP/Helmet | `next.config.ts`, `main.ts` | ⏱ 15 menit |
| 6 | H-7: Filter backend error responses | BFF routes | ⏱ 15 menit |
| 7 | H-1: Migrasi sisa admin pages ke BFF | 5+ admin pages | ⏱ 30 menit |
| 8 | M-2: Rental date validation | `rentals.service.ts` | ⏱ 5 menit |
| 9 | M-1: Voucher TOCTOU race condition | `vouchers.service.ts` | ⏱ 15 menit |
| 10 | M-3: Settings GET publik | `settings.controller.ts` | ⏱ 5 menit |

---

## Cara Menjalankan Ulang Audit

```bash
# 1. Cek TypeScript errors
cd backend && npx tsc --noEmit

# 2. Cek frontend errors
cd .. && npx tsc --noEmit

# 3. Cek langsung source code yang disebut
# 4. Jalankan k6 smoke test jika backend sudah running
# cd k6-tests && k6 run smoke-test.js
```
