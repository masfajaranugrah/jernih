# Audit Bug — Eccomarket

> **Tanggal:** 28 Agustus 2026
> **Scope:** Frontend (Next.js 16 App Router) + Backend (NestJS + Drizzle)
> **Metode:** TypeScript compile, `next build`, lint ESLint, `nest build`, inspeksi kode manual

---

## ✅ Status Verifikasi (Build & Compile)

| Check | Command | Status |
|-------|---------|--------|
| Frontend TypeScript | `npx tsc --noEmit` | ✅ Lolos |
| Frontend Build | `next build` | ✅ Sukses (64 halaman, 7 workers) |
| Backend TypeScript | `npx tsc --noEmit` | ✅ Lolos |
| Backend Build | `nest build` | ✅ Sukses |

> **Sebelum audit**, frontend TypeScript **GAGAL** dengan error `TS2554` di BFF proxy (3 tempat), sehingga `tsc` dan build tidak bisa lolos dengan benar. Ini sudah diperbaiki (lihat §B-1).

---

## 🔴 BUG YANG SUDAH DIPERBAIKI (sesi ini)

### B-1 — TypeScript error TS2554 di BFF Admin Proxy
- **File:** `src/app/api/admin/proxy/[...path]/route.ts:104-110`
- **Masalah:** Memanggil `revalidateTag("homepage_sections")` / `revalidateTag("hero")` / `revalidateTag("promo")` dengan **1 argumen**, padahal di Next.js 16.2.10 signature-nya `revalidateTag(tag, profile: string | CacheLifeConfig)` → butuh **2 argumen**.
- **Dampak:** Build & typecheck frontend gagal; admin dashboard tidak bisa di-build.
- **Perbaikan:** Diganti dengan `revalidatePath("/", "page")` — kompatibel dan sudah dipakai di file action lain (`product-actions.ts`, `hero-actions.ts`, dll).
- **Status:** ✅ Fixed

### B-2 — Realtime review produk rusak untuk pengunjung non-login
- **File:** `backend/src/chat/chat.gateway.ts` (`handleConnection`) + `src/app/(storefront)/produk/[slug]/ProductDetailClient.tsx:184`
- **Masalah:** `handleConnection` menolak **semua** koneksi tanpa token (`client.disconnect(true)`). Padahal halaman produk storefront membuka socket **tanpa token** untuk fitur review realtime yang diklaim "tidak butuh auth — publik".
- **Dampak:** Pengunjung non-login langsung di-disconnect + socket client **loop reconnect** (`reconnectionAttempts: 10` di `chatSocket.ts`); review baru tidak muncul realtime. **Inkonsistensi kontrak frontend↔backend.**
- **Perbaikan:** Guest kini diizinkan connect (untuk join room produk publik) dengan **rate-limit per IP** (`MAX_GUEST_CONNECTIONS_PER_IP = 5`) + timeout pembersihan 60 detik.
- **Catatan:** `handleDisconnect` sudah return early untuk user `guest-*`, jadi aman.
- **Status:** ✅ Fixed

### B-3 — Komponen dibuat ulang setiap render (countdown banner)
- **File:** `src/app/(storefront)/components/PromoBannerClient.tsx:22-29`
- **Masalah:** Komponen `Box` didefinisikan **di dalam** fungsi render `PromoBannerClient`. Karena countdown update tiap detik (`setInterval` 1s → `setLeft`), fungsi re-render tiap detik → `Box` direkonstruksi sebagai tipe baru → React **unmount & remount** seluruh subtree countdown tiap detik.
- **Dampak:** Performa buruk, state internal (jika ada) hilang tiap detik, potensi flicker.
- **Perbaikan:** `Box` dipindah ke *module scope* (di luar komponen).
- **Status:** ✅ Fixed — lint rule `react-hooks` "Cannot create components during render" hilang.

---

## 🟠 BUG YANG MASIH ADA (rekomendasi diperbaiki)

### A‑1 — Broken link "Reviews" di Sidebar Admin (404)
- **File:** `src/app/dashboard-admin/DashboardSidebar.tsx` (menu grup "Content") & `backend/src/products/products.controller.ts`
- **Masalah:** Sidebar menampilkan menu **Reviews** dengan href `/dashboard-admin/reviews`, tetapi **tidak ada route tersebut** di frontend (folder `src/app/dashboard-admin/reviews` tidak ada). Endpoint backend `GET /api/products/admin/reviews` sudah dibuat, tapi belum ada halaman UI-nya.
- **Dampak:** Admin klik "Reviews" → **halaman 404**.
- **Saran:** Buat halaman `src/app/dashboard-admin/reviews/page.tsx` yang memakai `adminApi` untuk memanggil `products/admin/reviews`, **atau** hapus entri menu Reviews dari sidebar sampai halaman dibuat.

### A‑2 — Duplikasi route pesanan admin
- **File:** `src/app/dashboard-admin/admin/pesanan/` vs `src/app/dashboard-admin/orders/`
- **Masalah:** Ada **dua** implementasi halaman pesanan admin. Sidebar sudah pindah ke `/dashboard-admin/orders`, tapi referensi lama `href="/dashboard-admin/admin/pesanan"` masih tersisa di `src/app/dashboard-admin/orders/[id]/page.tsx`.
- **Dampak:** Kebingungan pemeliharaan; kemungkinan logika pesanan terpecah di 2 tempat → risiko bug tak konsisten.
- **Saran:** Konsolidasi ke satu route (`/dashboard-admin/orders`), hapus `admin/pesanan` + sidebar lama, perbarui referensi.

---

## 🟡 TEMUAN LINT — Perlu Perhatian

Lint (`eslint src/`) menghasilkan **59 error + 66 warning**. Mayoritas adalah *false positive* dari rule React Compiler yang agresif, tapi beberapa layak diperiksa.

### C‑1 — `react-hooks/set-state-in-effect` (21 tempat)
Pola `useEffect(() => { setState(...) })` yang bisa memicu *cascading renders*.
- Paling penting: `src/app/(storefront)/keranjang/page.tsx` (6 tempat), `src/lib/auth-context.tsx:125` (panggil `refresh()` yang set state di dalam effect), `src/app/dashboard/pelanggan/[nama]/orders/[id]/page.tsx:477,485`.
- **Catatan:** Sebagian besar adalah pola *fetch-on-mount* yang wajar (mengisi data setelah mount) — bukan bug fatal, tapi `auth-context.tsx` layak dicek agar tidak memicu re-render berlebihan.

### C‑2 — `react-hooks/purity` — `Cannot call impure function during render`
- `src/app/(storefront)/keranjang/page.tsx:544` — `Math.random()` & `Date.now()` di dalam **`handlePay`** (event handler, bukan render murni) → **false positive** lint, bukan bug.
- `src/app/(storefront)/produk/[slug]/not-found.tsx:51` — periksa: impure call saat render halaman 404 → **perlu dicek** (bisa jadi bug jika memanggil fungsi side-effect langsung saat render).

### C‑3 — `react-hooks/refs` — `Cannot access refs during render`
- `src/app/(storefront)/keranjang/page.tsx:655,706`, `src/app/dashboard-admin/chat/page.tsx:88` — membaca ref langsung saat render (bukan di event/effect). Ini **pola yang benar-benar dilarang** (nilai ref belum siap saat render). Perlu dipindah ke `useEffect`/handler. **Berpotensi bug** (nilai basi/undefined).

### C‑4 — `react-hooks/immutability` — `Cannot access variable before it is declared`
- `src/app/(storefront)/keranjang/page.tsx:258` — `startCheckout()` dipanggil dalam effect sebelum deklarasi `async function startCheckout()`. **Bukan bug nyata** karena *function declarations ter-hoist*, hanya false positive lint.

### C‑5 — `@next/next/no-html-link-for-pages`
- `src/app/(info)/syarat-ketentuan/page.tsx:236` — menggunakan `<a>` untuk navigasi internal `/`; sebaiknya `next/link` `<Link>` (pakai client navigation).

### C‑6 — `@typescript-eslint/no-explicit-any` (26 tempat)
- Non-fatal, tapi melemahkan type safety (terutama `hero-store.ts`, `midtrans.ts`, `promo-actions.ts`, `admin-api.ts:39`).

### C‑7 — `@typescript-eslint/no-unused-vars`
- `src/app/(storefront)/error.tsx:4` — variabel `error` tidak dipakai (warning).

---

## 🔵 TEMUAN KEAMANAN / ARSITEKTUR (dari audit sebelumnya, belum tuntas)

> Referensi detail: `perbaikan.md` / `AUDIT_KEAMANAN.md`. Ringkasan yang masih relevan:

| # | Temuan | Status |
|---|--------|--------|
| H‑1 | Masih ada admin page yang bypass BFF (panggil backend langsung) | ⚠️ Parsial |
| H‑2 | Tidak ada CSP / security headers di `next.config.ts` | ⚠️ Belum |
| H‑3 | Tidak ada rate limiting global (login brute-force, dll.) | ⚠️ Belum |
| H‑7 | Error detail backend bocor via BFF (status codes lurus diteruskan) | ⚠️ Parsial |
| M‑4 | JWT 7 hari tanpa refresh/rotation (logout tidak revoke server-side) | ⚠️ Belum |
| M‑11/M‑12 | DTO chat/ticket message tanpa validasi `@IsOptional`/`@IsNotEmpty` | ⚠️ Belum |

**Yang sudah diperbaiki di sesi sebelumnya:** registrasi pilih role (C-1), middleware proxy aktif + verifikasi signature via jose (C-2, proxy.ts diubah), guard ROLES kategori & chat system-message (C-3/H-4), upload BFF forward token (C-4), HttpOnly cookie + BFF admin (C-5), CSRF origin check (H-6), open redirect login (H-5), sanitasi path traversal pada `upload.controller.ts` (baru), batas ukuran body 2mb di `main.ts` (baru), voucher atomic increment anti race (M-1, baru), timing-safe auth login (baru), LRU cache JWT strategy (baru).

---

## 📌 Prioritas Perbaikan (rekomendasi)

| Rank | Temuan | Kategori | Estimasi |
|------|--------|----------|----------|
| 1 | **A‑1: Broken link Reviews (404)** | Bug fungsional | 30–60 menit |
| 2 | **C‑3: Ref diakses saat render** (`keranjang`, `chat`) | Bug berpotensi | 15 menit |
| 3 | **A‑2: Duplikasi route pesanan** | Refactor | 30 menit |
| 4 | **C‑2: `not-found.tsx:51` impure saat render** | Perlu validasi | 10 menit |
| 5 | H‑3: Rate limiting global | Security | 30 menit |
| 6 | H‑2: Security headers (CSP/HSTS) | Security | 15 menit |
| 7 | H‑7: Filter error response BFF | Security | 15 menit |

---

## 🧰 Cara Menjalankan Ulang Audit

```bash
# Frontend
npx tsc --noEmit          # type check
npx next build            # build
npx eslint src/           # lint

# Backend
cd backend
npx tsc --noEmit
npm run build             # nest build
```
