# Eccomarket Backend

REST API untuk platform marketplace Eccomarket — dibangun dengan **NestJS**, **PostgreSQL**, dan **Prisma ORM**.

## Tech Stack

| Layer       | Teknologi                          |
|-------------|-------------------------------------|
| Framework   | NestJS 10 (Node.js + TypeScript)   |
| Database    | PostgreSQL                          |
| ORM         | Prisma 5                            |
| Auth        | JWT (passport-jwt) + bcryptjs      |
| Validasi    | class-validator + class-transformer |

---

## Persyaratan

- Node.js >= 18
- PostgreSQL >= 14 (running lokal atau cloud)
- npm atau yarn

---

## Setup Awal

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai yang benar:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/eccomarket?schema=public"
JWT_SECRET=ganti_dengan_secret_panjang_dan_acak
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 3. Buat database PostgreSQL

```sql
CREATE DATABASE eccomarket;
```

### 4. Jalankan migrasi Prisma

```bash
npm run prisma:migrate
# atau jika production:
npm run prisma:migrate:deploy
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

---

## Menjalankan Server

```bash
# Development (hot-reload)
npm run start:dev

# Production
npm run build
npm run start
```

Server berjalan di: `http://localhost:3001/api`

---

## Struktur Folder

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── main.ts                # Entry point
│   ├── app.module.ts          # Root module
│   ├── prisma/                # Prisma service (global)
│   ├── auth/                  # Register, Login, JWT
│   ├── users/                 # CRUD User
│   ├── mitra/                 # CRUD Mitra (seller)
│   ├── products/              # CRUD Produk
│   ├── services/              # CRUD Jasa
│   ├── rentals/               # CRUD Sewa
│   ├── orders/                # CRUD Order + checkout
│   ├── addresses/             # CRUD Alamat user
│   ├── vouchers/              # CRUD Voucher + validasi
│   ├── chat/                  # Pesan antar user
│   ├── hero/                  # Hero banner (admin)
│   └── complaints/            # Komplain / dispute
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint        | Akses   | Deskripsi          |
|--------|-----------------|---------|--------------------|
| POST   | `/register`     | Publik  | Daftar akun baru   |
| POST   | `/login`        | Publik  | Login, dapat JWT   |
| GET    | `/me`           | JWT     | Data user sendiri  |

**Contoh register:**
```json
POST /api/auth/register
{
  "email": "user@email.com",
  "password": "password123",
  "name": "Budi Santoso",
  "phone": "08123456789",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "role": "CUSTOMER" },
  "access_token": "eyJhbGci..."
}
```

---

### Users — `/api/users`

| Method | Endpoint   | Akses | Deskripsi              |
|--------|------------|-------|------------------------|
| GET    | `/`        | ADMIN | Semua user             |
| GET    | `/me`      | JWT   | Profile sendiri        |
| GET    | `/:id`     | JWT   | Detail user            |
| PATCH  | `/me`      | JWT   | Update profile sendiri |
| DELETE | `/:id`     | ADMIN | Hapus user             |

---

### Mitra — `/api/mitra`

| Method | Endpoint       | Akses | Deskripsi          |
|--------|----------------|-------|--------------------|
| POST   | `/`            | JWT   | Daftar jadi mitra  |
| GET    | `/`            | Publik| Semua mitra        |
| GET    | `/me`          | JWT   | Mitra milik sendiri|
| GET    | `/:id`         | Publik| Detail mitra       |
| PATCH  | `/:id`         | JWT   | Update mitra       |
| PATCH  | `/:id/verify`  | ADMIN | Verifikasi mitra   |

---

### Products — `/api/products`

| Method | Endpoint        | Akses  | Deskripsi                     |
|--------|-----------------|--------|-------------------------------|
| POST   | `/`             | JWT    | Tambah produk                 |
| GET    | `/`             | Publik | List produk (search, filter)  |
| GET    | `/slug/:slug`   | Publik | Produk by slug                |
| GET    | `/:id`          | Publik | Detail produk                 |
| PATCH  | `/:id`          | JWT    | Update produk                 |
| DELETE | `/:id`          | JWT    | Hapus produk                  |

**Query params GET `/api/products`:**
- `search` — pencarian nama/deskripsi
- `categoryId` — filter kategori
- `mitraId` — filter per mitra
- `minPrice`, `maxPrice`
- `page`, `limit` (default: 20)

---

### Services (Jasa) — `/api/services`

| Method | Endpoint | Akses  | Deskripsi    |
|--------|----------|--------|--------------|
| POST   | `/`      | JWT    | Tambah jasa  |
| GET    | `/`      | Publik | List jasa    |
| GET    | `/:id`   | Publik | Detail jasa  |
| PATCH  | `/:id`   | JWT    | Update jasa  |
| DELETE | `/:id`   | JWT    | Hapus jasa   |

---

### Rentals (Sewa) — `/api/rentals`

| Method | Endpoint  | Akses | Deskripsi              |
|--------|-----------|-------|------------------------|
| GET    | `/items`  | Publik| Semua item sewaan      |
| POST   | `/`       | JWT   | Buat booking sewa      |
| GET    | `/`       | JWT   | List sewa milik user   |
| GET    | `/:id`    | JWT   | Detail sewa            |
| PATCH  | `/:id`    | JWT   | Update status sewa     |

---

### Orders — `/api/orders`

| Method | Endpoint       | Akses | Deskripsi         |
|--------|----------------|-------|-------------------|
| POST   | `/`            | JWT   | Buat order baru   |
| GET    | `/`            | JWT   | List order        |
| GET    | `/:id`         | JWT   | Detail order      |
| PATCH  | `/:id/status`  | JWT   | Update status     |

---

### Addresses — `/api/addresses`

| Method | Endpoint | Akses | Deskripsi         |
|--------|----------|-------|-------------------|
| POST   | `/`      | JWT   | Tambah alamat     |
| GET    | `/`      | JWT   | List alamat saya  |
| GET    | `/:id`   | JWT   | Detail alamat     |
| PATCH  | `/:id`   | JWT   | Update alamat     |
| DELETE | `/:id`   | JWT   | Hapus alamat      |

---

### Vouchers — `/api/vouchers`

| Method | Endpoint    | Akses | Deskripsi            |
|--------|-------------|-------|----------------------|
| POST   | `/`         | ADMIN | Buat voucher         |
| GET    | `/`         | ADMIN | List semua voucher   |
| POST   | `/validate` | JWT   | Cek kode voucher     |
| DELETE | `/:id`      | ADMIN | Hapus voucher        |

---

### Chat — `/api/chat`

| Method | Endpoint          | Akses | Deskripsi             |
|--------|-------------------|-------|-----------------------|
| POST   | `/`               | JWT   | Kirim pesan           |
| GET    | `/inbox`          | JWT   | Daftar percakapan     |
| GET    | `/:partnerId`     | JWT   | Riwayat percakapan    |
| PATCH  | `/:senderId/read` | JWT   | Tandai sudah dibaca   |

---

### Hero Banner — `/api/hero`

| Method | Endpoint      | Akses | Deskripsi              |
|--------|---------------|-------|------------------------|
| GET    | `/`           | Publik| Semua banner           |
| PUT    | `/:position`  | ADMIN | Update/buat banner     |
| DELETE | `/reset`      | ADMIN | Reset semua banner     |

Position: `0` = hero utama, `1` = kanan atas, `2` = kiri bawah, `3` = kanan bawah

---

### Complaints — `/api/complaints`

| Method | Endpoint | Akses | Deskripsi          |
|--------|----------|-------|--------------------|
| POST   | `/`      | JWT   | Buat komplain      |
| GET    | `/`      | JWT   | List komplain      |
| GET    | `/:id`   | JWT   | Detail komplain    |
| PATCH  | `/:id`   | JWT   | Update status      |

---

## Autentikasi

Semua endpoint yang memerlukan JWT, sertakan header:

```
Authorization: Bearer <access_token>
```

---

## Role

| Role       | Akses                                    |
|------------|------------------------------------------|
| `CUSTOMER` | Order, alamat, chat, komplain, wishlist  |
| `MITRA`    | Kelola produk/jasa/sewa, terima order    |
| `ADMIN`    | Semua resource + verifikasi mitra        |

---

## Tools Tambahan

```bash
# Buka Prisma Studio (GUI database)
npm run prisma:studio

# Lihat log query Prisma (tambah di .env):
# DATABASE_URL="...?schema=public"
# Dan set di PrismaService: log: ['query']
```
