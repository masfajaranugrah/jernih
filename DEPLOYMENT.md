# Panduan Deploy Eccomarket ke VPS

Panduan ini mencakup deployment full-stack Eccomarket:
- **Frontend**: Next.js (port 3000) → `jernihcreative.com`
- **Backend**: NestJS + Prisma (port 3001) → `api.jernihcreative.com`
- **Database**: PostgreSQL (install langsung di VPS)
- **Web Server**: Nginx sebagai reverse proxy
- **Process Manager**: PM2

---

## Prasyarat VPS

- OS: Ubuntu 22.04 LTS (direkomendasikan)
- RAM: minimal 1 GB
- Akses SSH sebagai `root`
- Domain `jernihcreative.com` dan `api.jernihcreative.com` sudah diarahkan ke IP VPS

---

## 1. Setup Awal VPS

Login ke VPS via SSH:

```bash
ssh root@IP_VPS_KAMU
```

Update sistem:

```bash
apt update && apt upgrade -y
```

---

## 2. Install Node.js (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifikasi
node -v   # v20.x.x
npm -v
```

---

## 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

---

## 4. Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

---

## 5. Install & Setup PostgreSQL

### Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

### Buat Database & User

Switch ke user postgres:

```bash
su - postgres
psql
```

Di dalam psql, jalankan:

```sql
CREATE USER eccomarket WITH PASSWORD 'password_kuat_kamu';
CREATE DATABASE eccomarket_db OWNER eccomarket;
GRANT ALL PRIVILEGES ON DATABASE eccomarket_db TO eccomarket;
\q
```

Keluar dari user postgres:

```bash
exit
```

---

## 6. Upload Kode ke VPS

### Via Git (direkomendasikan)

```bash
cd /var/www
git clone https://github.com/USERNAME/eccomarket.git
chown -R creative:creative /var/www/eccomarket
cd eccomarket
```

### Via SCP dari komputer lokal

Jalankan dari terminal lokal:

```bash
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='backend/dist' \
  /Users/fajaranugrah/Documents/eccomarket/ \
  root@IP_VPS_KAMU:/var/www/eccomarket/
```

---

## 7. Setup Backend (NestJS)

```bash
cd /var/www/eccomarket/backend
```

### Install dependencies

```bash
npm install
```

### Buat file `.env`

```bash
nano .env
```

Isi:

```env
PORT=3001
NODE_ENV=production

# PostgreSQL lokal VPS
DATABASE_URL="postgresql://eccomarket:password_kuat_kamu@localhost:5432/eccomarket_db"

# Ganti dengan secret yang kuat (minimal 32 karakter acak)
JWT_SECRET=ganti_dengan_secret_panjang_dan_acak_minimal_32_karakter

JWT_EXPIRES_IN=7d

# Domain frontend
CORS_ORIGIN=https://jernihcreative.com
```

> **Penting**: Jangan pernah commit file `.env` ke Git.

### Jalankan migrasi database

```bash
npx prisma migrate deploy
```

### (Opsional) Jalankan seed data awal

```bash
npx ts-node prisma/seed.ts
```

### Build backend

```bash
npm run build
```

### Jalankan dengan PM2

```bash
pm2 start dist/main.js --name "eccomarket-backend"
pm2 save
```

---

## 8. Setup Frontend (Next.js)

```bash
cd /var/www/eccomarket
```

### Install dependencies

```bash
npm install
```

### Buat file `.env.local`

```bash
nano .env.local
```

Isi:

```env
NEXT_PUBLIC_API_URL=https://api.jernihcreative.com/api
```

### Build frontend

```bash
npm run build
```

### Jalankan dengan PM2

```bash
pm2 start npm --name "eccomarket-frontend" -- start
pm2 save
```

### Aktifkan PM2 saat server reboot

```bash
pm2 startup
# Jalankan perintah yang muncul dari output di atas
pm2 save
```

---

## 9. Konfigurasi Nginx (Reverse Proxy)

Buat file konfigurasi Nginx:

```bash
nano /etc/nginx/sites-available/jernihcreative
```

Paste konfigurasi berikut:

```nginx
# Frontend — Next.js
server {
    listen 80;
    server_name jernihcreative.com www.jernihcreative.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 20M;
}

# Backend — NestJS API
server {
    listen 80;
    server_name api.jernihcreative.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload/static files dari backend
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    client_max_body_size 20M;
}
```

Aktifkan konfigurasi:

```bash
ln -s /etc/nginx/sites-available/jernihcreative /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 10. Setup HTTPS dengan Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d jernihcreative.com -d www.jernihcreative.com -d api.jernihcreative.com
```

Ikuti instruksi di layar. Certbot akan otomatis memodifikasi konfigurasi Nginx untuk HTTPS.

Aktifkan auto-renewal:

```bash
systemctl enable certbot.timer
```

---

## 11. Verifikasi Deployment

Cek status PM2:

```bash
pm2 status
```

Output yang diharapkan:
```
┌────┬──────────────────────────┬─────────┬───────┐
│ id │ name                     │ status  │ cpu   │
├────┼──────────────────────────┼─────────┼───────┤
│ 0  │ eccomarket-backend       │ online  │ 0%    │
│ 1  │ eccomarket-frontend      │ online  │ 0%    │
└────┴──────────────────────────┴─────────┴───────┘
```

Cek log jika ada error:

```bash
pm2 logs eccomarket-backend
pm2 logs eccomarket-frontend
```

Test akses:

```bash
curl http://localhost:3000        # Frontend
curl http://localhost:3001/api    # Backend
```

---

## 12. Update / Redeploy

Setiap kali ada perubahan kode:

```bash
cd /var/www/eccomarket
git pull origin main

# Update backend
cd backend
npm install
npm run build
npx prisma migrate deploy
pm2 restart eccomarket-backend

# Update frontend
cd ..
npm install
npm run build
pm2 restart eccomarket-frontend
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| PM2 process crash loop | Cek log: `pm2 logs` |
| Port sudah dipakai | `lsof -i :3000` atau `:3001` |
| Nginx 502 Bad Gateway | Pastikan PM2 sedang running |
| Database connection error | Cek `DATABASE_URL` di `.env` backend |
| CORS error | Pastikan `CORS_ORIGIN` di `.env` backend sesuai `https://jernihcreative.com` |
| Upload file tidak muncul | Pastikan folder `backend/public/uploads` ada dan writable |
| psql: Peer authentication failed | Gunakan `su - postgres` lalu `psql` |

Buat folder uploads jika belum ada:

```bash
mkdir -p /var/www/eccomarket/backend/public/uploads
chmod 755 /var/www/eccomarket/backend/public/uploads
```

---

## Ringkasan

| Service | Port | Domain |
|---|---|---|
| Next.js Frontend | 3000 | `jernihcreative.com` |
| NestJS Backend | 3001 | `api.jernihcreative.com` |
| PostgreSQL | 5432 | Lokal (tidak expose ke publik) |
| Nginx | 80 / 443 | Publik |
