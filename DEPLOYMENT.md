# Panduan Deploy Eccomarket ke VPS

Panduan ini mencakup deployment full-stack Eccomarket:
- **Frontend**: Next.js (port 3000) → `jernihcreatif.com`
- **Backend**: NestJS + Prisma (port 3001) → `api.jernihcreatif.com`
- **Database**: PostgreSQL (install langsung di VPS)
- **Web Server**: Nginx sebagai reverse proxy + SSL (Let's Encrypt)
- **Process Manager**: PM2

---

## Prasyarat VPS

- OS: Ubuntu 22.04 LTS (direkomendasikan)
- RAM: minimal 1 GB (+ swap 1GB, lihat bagian Optimasi Performa)
- Akses SSH sebagai `root`
- Domain `jernihcreatif.com` dan `api.jernihcreatif.com` sudah diarahkan ke IP VPS

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
chown -R www-data:www-data /var/www/eccomarket
cd eccomarket
```

### Via rsync dari komputer lokal

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
CORS_ORIGIN=https://jernihcreatif.com
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
NEXT_PUBLIC_API_URL=https://api.jernihcreatif.com/api
API_URL=https://api.jernihcreatif.com/api
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

## 9. Konfigurasi Nginx (Reverse Proxy + SSL)

Buat file konfigurasi Nginx:

```bash
nano /etc/nginx/sites-available/jernihcreatif
```

Paste konfigurasi berikut (konfigurasi aktual yang berjalan di VPS):

```nginx
# Frontend — Next.js
server {
    server_name jernihcreatif.com www.jernihcreatif.com;

    # Cache static assets Next.js (JS, CSS) — 1 tahun, immutable
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_bypass $http_upgrade;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

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

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/jernihcreatif.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jernihcreatif.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Backend — NestJS API
server {
    server_name api.jernihcreatif.com;

    # Cache gambar upload — 30 hari
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public";
    }

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

    client_max_body_size 20M;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/jernihcreatif.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jernihcreatif.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP → HTTPS redirect (frontend)
server {
    listen 80;
    server_name jernihcreatif.com www.jernihcreatif.com;

    if ($host = www.jernihcreatif.com) {
        return 301 https://$host$request_uri;
    }

    if ($host = jernihcreatif.com) {
        return 301 https://$host$request_uri;
    }

    return 404;
}

# HTTP → HTTPS redirect (backend)
server {
    listen 80;
    server_name api.jernihcreatif.com;

    if ($host = api.jernihcreatif.com) {
        return 301 https://$host$request_uri;
    }

    return 404;
}
```

Aktifkan konfigurasi:

```bash
ln -s /etc/nginx/sites-available/jernihcreatif /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 10. Setup HTTPS dengan Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d jernihcreatif.com -d www.jernihcreatif.com -d api.jernihcreatif.com
```

Ikuti instruksi di layar. Certbot akan otomatis memodifikasi konfigurasi Nginx untuk HTTPS.

Aktifkan auto-renewal:

```bash
systemctl enable certbot.timer
```

---

## 11. Optimasi Performa

### Tambah Swap (wajib untuk VPS RAM 1GB)

Swap mencegah server crash saat RAM penuh:

```bash
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Buat permanen setelah reboot
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Verifikasi
free -h
```

### Batasi penggunaan RAM Next.js

```bash
pm2 delete eccomarket-frontend
NODE_OPTIONS="--max-old-space-size=400" pm2 start npm --name "eccomarket-frontend" -- start
pm2 save
```

### Monitoring real-time

```bash
pm2 monit     # CPU & RAM per proses
free -h       # Total RAM & swap
top           # Semua proses sistem
```

---

## 12. Verifikasi Deployment

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
pm2 logs eccomarket-backend --lines 50
pm2 logs eccomarket-frontend --lines 50
```

Test akses:

```bash
curl -I https://jernihcreatif.com         # Frontend
curl -I https://api.jernihcreatif.com/api  # Backend
```

---

## 13. Update / Redeploy

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
| Port sudah dipakai | `lsof -i :3000` atau `lsof -i :3001` |
| Nginx 502 Bad Gateway | Pastikan PM2 sedang running: `pm2 status` |
| Database connection error | Cek `DATABASE_URL` di `.env` backend |
| CORS error | Pastikan `CORS_ORIGIN=https://jernihcreatif.com` di `.env` backend |
| Upload file tidak muncul | Pastikan folder `backend/public/uploads` ada dan writable |
| psql: Peer authentication failed | Gunakan `su - postgres` lalu `psql` |
| Server lambat / berat | Tambah swap 1GB, jalankan `free -h` dan `pm2 monit` |
| SSL expired | `certbot renew --dry-run` untuk test, lalu `certbot renew` |

Buat folder uploads jika belum ada:

```bash
mkdir -p /var/www/eccomarket/backend/public/uploads
chmod 755 /var/www/eccomarket/backend/public/uploads
```

---

## Ringkasan

| Service | Port | Domain |
|---|---|---|
| Next.js Frontend | 3000 | `https://jernihcreatif.com` |
| NestJS Backend | 3001 | `https://api.jernihcreatif.com` |
| PostgreSQL | 5432 | Lokal (tidak expose ke publik) |
| Nginx | 80 / 443 | Publik (redirect HTTP → HTTPS) |
