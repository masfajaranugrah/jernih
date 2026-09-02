 

> Buat halaman Pesanan Jernih Creative terlihat **clean, modern, profesional, premium, rapi, dan terasa seperti marketplace/e-commerce modern**, bukan seperti dashboard template sederhana.

Jangan hanya mengganti warna. Perbaiki juga:

* visual hierarchy
* spacing
* typography
* card design
* status badge
* tabs
* navigation
* information hierarchy
* responsive layout
* interaction
* empty state
* loading state

* promo section
* admin order management

---

# 1. DESIGN SYSTEM

Gunakan color system berikut secara konsisten.

### Primary

```text
Primary       #2563EB
Primary Hover #1D4ED8
Primary Light #EFF6FF
```

### Neutral

```text
Navy          #0F172A
Text          #111827
Text Secondary #64748B
Background    #F8FAFC
White         #FFFFFF
Border        #E2E8F0
```

### Semantic

```text
Success       #16A34A
Success Light #F0FDF4

Warning       #F59E0B
Warning Light #FFFBEB

Danger        #EF4444
Danger Light  #FEF2F2
```

### Rules

Gunakan:

* Blue untuk primary action, active state, link, dan brand interaction.
* Navy untuk heading.
* Gray untuk secondary information.
* Green untuk pembayaran berhasil, selesai, dan status sukses.
* Orange untuk menunggu/perhatian.
* Red hanya untuk dibatalkan, error, dan promo/diskon.
* Jangan membuat setiap status menggunakan warna yang berbeda-beda secara berlebihan.
* Jangan menggunakan gradient berlebihan.
* Jangan menggunakan shadow berat.
* Jangan membuat UI terlalu colorful.

Target visual:

**White + Navy + Blue + Soft Gray**

dengan semantic colors hanya sebagai aksen.

---

# 2. CUSTOMER DASHBOARD — PESANAN SAYA

Halaman customer saat ini memiliki:

```text
Pesanan Saya
Pantau status pesanan dan riwayat belanja Anda.

Semua
Belum Bayar
Dikemas
Dikirim
Selesai
```

Pertahankan konsep tersebut tetapi redesign agar lebih profesional.

---

# 3. CUSTOMER HEADER

Buat header halaman lebih clean.

Gunakan:

```text
Pesanan Saya
Pantau status pesanan dan riwayat belanja Anda.
```

Heading:

```text
#0F172A
```

Subtitle:

```text
#64748B
```

Jangan menggunakan font terlalu besar sampai menghabiskan ruang.

Tambahkan action yang relevan di kanan atas jika memang sesuai dengan struktur aplikasi, misalnya:

```text
Promo Saya
```

atau:

```text
Cari Pesanan
```

Jangan menambahkan fitur yang tidak diperlukan.

---

# 4. CUSTOMER PROMO BANNER

Tambahkan section **Promo untuk pelanggan** di halaman Pesanan.

Contoh:

```text
Promo Khusus Untukmu 🎉

Diskon 15% untuk Semua Produk

Gunakan kode: JERNIH15

[Lihat Promo]
```

Desain promo harus clean dan premium.

Gunakan:

```text
Background: #EFF6FF
Border: #DBEAFE
Primary: #2563EB
```

Promo merah hanya digunakan jika memang promo tersebut merupakan flash sale/diskon besar.

Banner tidak boleh terlalu tinggi.

Tujuannya adalah:

> Memberikan kesempatan cross-selling tanpa mengganggu informasi pesanan.

Jika sistem sudah memiliki data promo dari database/API, gunakan data tersebut.

**Jangan membuat data promo hardcode jika sistem promo sudah tersedia.**

Jika data promo belum tersedia, buat komponen UI yang mudah diintegrasikan dengan data promo nantinya.

---

# 5. CUSTOMER ORDER TABS

Redesign tab:

```text
Semua
Belum Bayar
Dikemas
Dikirim
Selesai
Dibatalkan
```

Gunakan active state:

```text
color: #2563EB
border-bottom: #2563EB
```

Tab inactive:

```text
#64748B
```

Jangan menggunakan background tab yang terlalu berat.

Pada mobile, tab harus dapat di-scroll secara horizontal.

---

# 6. CUSTOMER ORDER CARD

Order card saat ini terlihat terlalu kosong dan kurang premium.

Redesign menjadi card marketplace modern.

Informasi:

```text
#ORD-0416B2FE1
25 Agustus 2026
```

Status:

```text
Dikemas
```

Produk:

```text
[Product Image]

Kamera DSLR Canon EOS
1 x Rp 8.000.000
```

Total:

```text
Total Belanja
Rp 8.005.000
```

Action:

```text
Lihat Detail →
```

Gunakan hierarchy yang jelas.

Order ID kecil.

Nama produk lebih prominent.

Harga total harus terlihat jelas.

Status badge harus mudah ditemukan.

---

# 7. STATUS BADGE CUSTOMER

Gunakan status yang konsisten.

Contoh:

```text
Belum Bayar
```

gunakan warning/orange.

```text
Dibayar
```

gunakan success/green.

```text
Dikemas
```

gunakan blue.

```text
Dikirim
```

gunakan blue/indigo yang masih satu family.

```text
Selesai
```

gunakan green.

```text
Dibatalkan
```

gunakan red.

Jangan menggunakan warna random.

---

# 8. REALTIME STATUS UPDATE

Ini WAJIB.

Ketika admin mengubah status order, customer harus mendapatkan update **secara realtime tanpa refresh browser**.

Flow:

```text
ADMIN
↓
Update Status
↓
Database
↓
Laravel Event
↓
Broadcast
↓
Laravel Reverb / WebSocket
↓
Laravel Echo
↓
Customer Dashboard
↓
Order Card otomatis berubah
```

Ketika event diterima customer:

* update status badge
* update status text
* update order timeline jika ada
* update data order terkait
* tampilkan subtle animation
* optional toast:

```text
Status pesanan #ORD-0416B2FE1 diperbarui
```

Jangan reload halaman.

Gunakan private channel.

Customer hanya boleh menerima event order miliknya sendiri.

---

# 9. CUSTOMER ORDER DETAIL

Ketika customer membuka detail order, desain harus memiliki visual timeline.

Contoh:

```text
✓ Pesanan Dibuat
      │
      ✓ Pembayaran Berhasil
      │
      ● Pesanan Dikemas
      │
      ○ Pesanan Dikirim
      │
      ○ Pesanan Selesai
```

Status aktif menggunakan primary blue.

Status selesai menggunakan green.

Status belum dilakukan menggunakan neutral gray.

Timeline harus terlihat modern dan mudah dipahami.

---

# 10. CUSTOMER RESPONSIVE

Desktop:

* gunakan layout yang lega
* maksimal content width yang nyaman
* jangan terlalu melebar

Tablet:

* sesuaikan grid

Mobile:

* order card menjadi satu kolom
* sidebar menjadi mobile navigation
* tabs horizontal scroll
* promo banner responsive
* tombol tidak boleh overflow
* product image tetap proporsional
* harga tetap mudah dibaca

Jangan sekadar mengecilkan desktop UI.

Buat hierarchy mobile yang benar.

---

# 11. ADMIN DASHBOARD — PESANAN

Halaman admin saat ini terlihat terlalu mirip dengan customer dashboard.

**Pisahkan visual language customer dan admin.**

Admin membutuhkan UI yang lebih data-oriented.

Admin harus dapat melihat:

```text
Pesanan
Total Pesanan
Belum Bayar
Dikemas
Dikirim
Selesai
Dibatalkan
Total Penjualan
```

---

# 12. ADMIN SUMMARY CARDS

Tambahkan summary cards di bagian atas.

Contoh:

```text
Total Pesanan
1.248

Belum Bayar
78

Dikemas
156

Dikirim
320

Selesai
612

Total Penjualan
Rp 1.248.590.000
```

Card harus clean.

Jangan menggunakan warna background berbeda-beda secara berlebihan.

Gunakan icon circle kecil sebagai accent.

---

# 13. ADMIN ORDER FILTER

Admin harus memiliki:

```text
Search
Filter Status
Filter Pembayaran
Date Range
```

Search:

```text
Cari order ID, pelanggan, produk...
```

Tambahkan filter button.

Date range harus clean.

Semua filter harus responsive.

---

# 14. ADMIN ORDER TABLE

Pada desktop, gunakan table karena admin membutuhkan informasi banyak.

Kolom:

```text
Order ID
Tanggal
Pelanggan
Produk
Total
Status
Pembayaran
Aksi
```

Contoh:

```text
#ORD-0416B2FE1
25 Aug 2026 16:52
Asep Koko
Kamera DSLR Canon EOS
Rp 8.005.000
Dikemas
Dibayar
Lihat
```

Jangan membuat table terlalu padat.

Gunakan:

* row height nyaman
* border subtle
* typography hierarchy
* status badge
* hover state
* action menu

---

# 15. ADMIN STATUS UPDATE

Admin harus dapat mengubah status langsung dari table/detail.

Contoh:

```text
Dikemas ▼
```

Ketika diklik:

```text
Belum Bayar
Dibayar
Dikemas
Dikirim
Selesai
Dibatalkan
```

Setelah admin memilih status:

1. update database
2. validate status transition
3. broadcast event
4. customer menerima update realtime
5. admin UI ikut update
6. tampilkan toast success

Contoh:

```text
Status pesanan berhasil diperbarui
```

---

# 16. ADMIN ORDER DETAIL

Buat detail order menjadi lebih profesional.

Struktur:

```text
Order Information
Customer Information
Product Information
Payment Information
Shipping Information
Order Timeline
```

Gunakan card yang terpisah secara visual.

Admin dapat melihat:

```text
Order ID
Customer
Email
Phone
Address
Products
Subtotal
Discount
Shipping
Total
Payment Method
Payment Status
Order Status
```

---

# 17. PAYMENT STATUS

Pisahkan:

```text
Order Status
```

dan:

```text
Payment Status
```

Contoh:

```text
Order Status:
Dikemas

Payment:
Dibayar
```

Jangan mencampurkan kedua status tersebut.

Contoh payment:

```text
Menunggu Pembayaran
Dibayar
Gagal
Refund
```

Gunakan status payment yang sudah tersedia pada project.

---

# 18. PROMO DI ADMIN

Tambahkan akses promo yang jelas pada admin.

Admin harus dapat melihat/manage:

```text
Promo
Voucher
Kode Promo
Periode Promo
Diskon
Status Aktif
```

Tetapi **jangan membuat halaman promo baru jika fitur promo sudah tersedia**.

Gunakan struktur existing.

Pada halaman Pesanan admin, promo dapat ditampilkan sebagai informasi:

```text
Promo digunakan
JERNIH15
Diskon Rp 120.000
```

---

# 19. SIDEBAR ADMIN

Sidebar admin saat ini terlalu padat dan visual hierarchy-nya kurang bagus.

Rapikan grouping menu.

Contoh:

```text
MAIN
Dashboard
Pesanan

CATALOG
Produk
Kategori
Promo
Voucher

SERVICE
Jasa
Sewa

CUSTOMER
Pelanggan
Chat
Bantuan

FINANCE
Payments
Laporan

CONTENT
Homepage
Hero Banner
Reviews

SYSTEM
Pengaturan
```

Gunakan divider/group label kecil.

Active menu menggunakan:

```text
#2563EB
```

Jangan membuat seluruh sidebar terlalu gelap jika tidak diperlukan.

Gunakan navy/dark sidebar hanya jika memang menghasilkan hierarchy yang lebih profesional.

---

# 20. CUSTOMER SIDEBAR

Customer sidebar:

```text
Orders
Wishlist
Vouchers
Chat
Bantuan
Addresses
Profile
```

harus dibuat lebih clean.

Active:

```text
#2563EB
background #EFF6FF
```

Icon inactive:

```text
#64748B
```

Jangan menggunakan border hitam/warna gelap yang terlalu kuat.

---

# 21. EMPTY STATE

Tambahkan empty state profesional.

Jika tidak ada order:

```text
Belum ada pesanan

Pesanan yang kamu buat akan muncul di sini.

[Mulai Belanja]
```

Untuk tab:

```text
Belum Bayar
Dikemas
Dikirim
Selesai
```

jika kosong, gunakan empty state yang sesuai.

---

# 22. LOADING STATE

Gunakan skeleton loading.

Jangan membuat halaman blank ketika data sedang loading.

Skeleton:

* order card
* product image
* text
* status
* total

Gunakan subtle animation.

---

# 23. ERROR STATE

Jika API gagal:

```text
Pesanan tidak dapat dimuat

Terjadi masalah saat mengambil data pesanan.

[Coba Lagi]
```

Jangan menampilkan error technical kepada customer.

---

# 24. TYPOGRAPHY

Gunakan typography modern.

Hierarchy:

```text
Page Heading     32–40px / 700
Section Heading  20–24px / 600–700
Card Heading     16–18px / 600
Body             14–16px / 400–500
Caption          12–14px / 400
```

Jika project sudah menggunakan font tertentu yang bagus, pertahankan.

Jangan mengganti font secara sembarangan.

---

# 25. SPACING

Gunakan spacing system konsisten:

```text
4
8
12
16
20
24
32
40
48
```

Jangan menggunakan margin/padding random.

---

# 26. CARD STYLE

Gunakan:

```text
border: 1px solid #E2E8F0
border-radius: 16px
background: #FFFFFF
```

Shadow sangat ringan.

Contoh:

```text
0 2px 8px rgba(...)
```

Jangan menggunakan shadow besar.

Hover:

* border sedikit berubah
* shadow sedikit meningkat
* transition 150–200ms

---

# 27. ICON

Gunakan icon library yang sudah digunakan project.

Jangan mencampurkan banyak jenis icon.

Semua icon harus memiliki:

* stroke width konsisten
* ukuran konsisten
* visual weight konsisten

---

# 28. MICRO INTERACTION

Tambahkan subtle interaction:

* hover card
* button hover
* tab transition
* status transition
* toast
* dropdown transition
* skeleton loading

Tetapi jangan berlebihan.

---

# 29. MOBILE CUSTOMER

Mobile harus menjadi prioritas.

Customer mobile harus tetap terlihat seperti marketplace profesional.

Order card:

```text
Order ID
Status
Product
Price
Total
Action
```

jangan terlalu banyak informasi dalam satu baris.

Jika sidebar desktop berubah menjadi bottom navigation, pastikan:

```text
Home
Orders
Wishlist
Cart
Profile
```

memiliki hierarchy yang jelas.

---

# 30. JANGAN MERUSAK FUNCTIONALITY

Ini sangat penting.

Jangan mengubah:

* API contract
* route
* authentication
* database structure
* existing order logic
* payment logic
* checkout
* cart
* promo calculation

kecuali memang diperlukan.

Jika harus mengubah backend, lakukan dengan perubahan seminimal mungkin.

---

# 31. SEBELUM CODING

Sebelum melakukan perubahan, inspect project terlebih dahulu.

Cari:

```text
Order model
Order controller
Admin order controller
Customer order controller
Order routes
Order API
Order status enum/constants
Payment status
Promo model
Voucher model
Customer dashboard
Admin dashboard
Broadcasting configuration
Laravel Echo
Reverb configuration
```

Jangan langsung membuat file baru sebelum mengetahui struktur project.

---

# 32. REALTIME IMPLEMENTATION

Jika aplikasi menggunakan Laravel:

Gunakan:

```text
Laravel Broadcasting
Laravel Reverb
Laravel Echo
Private Channels
```

Buat event seperti:

```text
OrderStatusUpdated
```

Broadcast hanya ke customer yang memiliki order tersebut.

Pastikan authorization private channel aman.

Customer A tidak boleh menerima event customer B.

---

# 33. FINAL QUALITY CHECK

Setelah selesai coding, lakukan pengecekan:

### Customer

* [ ] Order list terlihat modern
* [ ] Promo tampil dengan baik
* [ ] Status badge konsisten
* [ ] Order detail profesional
* [ ] Timeline status tersedia
* [ ] Responsive desktop
* [ ] Responsive mobile
* [ ] Empty state
* [ ] Loading state
* [ ] Error state
* [ ] Realtime status update

### Admin

* [ ] Summary cards
* [ ] Search
* [ ] Filter
* [ ] Date range
* [ ] Order table
* [ ] Status dropdown
* [ ] Payment status
* [ ] Order detail
* [ ] Promo information
* [ ] Responsive
* [ ] Toast notification

### Realtime

Test:

```text
Browser 1:
Customer Dashboard

Browser 2:
Admin Dashboard
```

Admin mengubah:

```text
Dikemas
→
Dikirim
```

Customer harus melihat:

```text
Dikirim
```

**langsung tanpa refresh.**

---

# 34. HASIL AKHIR

Target visual customer:

> Clean marketplace + premium + simple + trustworthy.

Target visual admin:

> Professional back-office + data-oriented + efficient.

Keduanya harus menggunakan **design system yang sama**, tetapi hierarchy dan layout disesuaikan dengan kebutuhan masing-masing.

Jangan hanya membuat halaman "lebih berwarna".

Saya ingin hasil yang benar-benar terasa seperti **UI/UX designer profesional yang melakukan redesign**, dengan perhatian terhadap spacing, typography, hierarchy, usability, responsive behavior, accessibility, dan consistency.

**Inspect existing implementation terlebih dahulu, kemudian implementasikan redesign langsung ke project. Jangan membuat mockup saja.**
