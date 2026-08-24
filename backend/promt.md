Buatkan fitur **Detail Riwayat Pesanan** pada halaman detail pesanan pelanggan dengan desain modern, clean, profesional, dan konsisten dengan tampilan dashboard/e-commerce yang sudah ada.

Pada bagian informasi pesanan terdapat data berikut:

### Informasi Pembayaran

**Pembayaran Berhasil**
Bayar melalui **BNI Virtual Account**

### Informasi Status

**Order Status:** Pesanan sedang dikirim
**Payment Status:** Pembayaran Berhasil

Saya ingin bagian status tersebut dapat **diklik**, terutama:

* **Pesanan sedang dikirim**
* **Pembayaran Berhasil**

Ketika user mengklik salah satu status tersebut, tampilkan sebuah **modal popup** yang berisi detail riwayat pesanan dalam bentuk **timeline vertikal**.

### Isi Modal

Judul modal:

**Detail Pengiriman**

Tampilkan timeline seperti berikut:

**22 Agu 2026 — 10:30**
● **Pesanan sedang dikirim**
Pesanan sedang dalam perjalanan

**22 Agu 2026 — 08:15**
● **Pesanan diproses**
Pesanan sedang dipersiapkan

**21 Agu 2026 — 19:42**
● **Pembayaran berhasil**
Pembayaran melalui BNI Virtual Account telah dikonfirmasi

**21 Agu 2026 — 19:40**
● **Pesanan dibuat**
Pesanan berhasil dibuat

### Ketentuan UI/UX

* Gunakan desain timeline vertikal.
* Tampilkan tanggal dan jam di sisi kiri.
* Gunakan garis vertikal sebagai penghubung setiap status.
* Status terbaru berada paling atas.
* Status terbaru menggunakan indikator yang lebih menonjol.
* Modal memiliki tombol close/X di bagian kanan atas.
* Modal bisa ditutup ketika klik area di luar modal.
* Tambahkan animasi fade dan scale saat modal dibuka maupun ditutup.
* Desain harus responsive untuk desktop dan mobile.
* Gunakan style yang clean, modern, dan profesional.
* Status **Pesanan sedang dikirim** dan **Pembayaran Berhasil** tampil seperti elemen interaktif, misalnya menggunakan cursor pointer, hover effect, dan icon chevron/arrow agar user mengetahui bahwa status tersebut dapat diklik.
* Jangan mengubah struktur atau desain halaman detail pesanan yang sudah ada secara berlebihan.
* Integrasikan fitur ini dengan data pesanan yang sudah ada.
* Buat komponen modal yang reusable agar nantinya dapat digunakan untuk pesanan lainnya.
* Jika memungkinkan, data timeline dibuat dinamis dari array/object seperti `orderHistory` agar mudah diambil dari API/database.

Pastikan ketika user mengklik:

**Order Status: Pesanan sedang dikirim**

atau

**Payment Status: Pembayaran Berhasil**

maka modal **Detail Pengiriman / Riwayat Pesanan** langsung terbuka dan menampilkan timeline lengkap sesuai data pesanan tersebut.

Gunakan kode yang rapi, reusable, dan mudah dikembangkan.
