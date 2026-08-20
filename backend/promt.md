# Perbaiki Error React Order Detail dan Lanjutkan Fitur Promo

Perbaiki seluruh error pada halaman **OrderDetailPage**, khususnya error:

`React has detected a change in the order of Hooks called by OrderDetailPage`

dan:

`Rendered more hooks than during the previous render`

Error terjadi karena hook `useCountdown` dipanggil secara kondisional atau setelah kemungkinan `return` sehingga jumlah dan urutan hooks berubah antar render. Log menunjukkan hook tambahan muncul pada render berikutnya dan `useCountdown` dipanggil dari `page.tsx` sekitar baris 540.

## Aturan Perbaikan Hooks

* Semua `useState`, `useEffect`, `useMemo`, `useCallback`, dan custom hook seperti `useCountdown` harus selalu dipanggil di level paling atas component.
* Jangan pernah memanggil hook di dalam:

  * `if`
  * `switch`
  * loop
  * function callback
  * conditional return
* Jangan lakukan pola seperti:

```tsx
if (order) {
  const countdown = useCountdown(order.expired_at);
}
```

Perbaiki menjadi:

```tsx
const countdown = useCountdown(order?.expired_at ?? null);

if (!order) {
  return <Loading />;
}
```

Pastikan `useCountdown` tetap aman ketika parameter `null` atau data order belum tersedia.

## Perbaiki Custom Hook useCountdown

Buat `useCountdown` dapat menerima tanggal nullable:

```tsx
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: false,
      });

      return;
    }

    const updateCountdown = () => {
      const difference =
        new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
        expired: false,
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}
```

## Lanjutkan Pembuatan Fitur Promo

Setelah error hooks diperbaiki, buat fitur promo yang profesional dan responsif untuk desktop dan mobile.

Fitur promo harus memiliki:

### 1. Banner Promo

* Banner promo menarik di halaman utama.
* Bisa menampilkan judul promo.
* Subtitle/deskripsi.
* Gambar banner.
* Tombol `Belanja Sekarang`.
* Countdown jika promo memiliki waktu berakhir.
* Responsif untuk mobile dan desktop.
* Jangan sampai gambar atau teks terpotong.

Contoh:

**PROMO SPESIAL HARI INI 🔥**

Diskon hingga 50% untuk produk pilihan.

`[ Belanja Sekarang ]`

### 2. Halaman Daftar Promo

Buat halaman khusus promo dengan:

* Promo aktif.
* Promo akan datang.
* Promo telah berakhir.
* Filter kategori promo.
* Search produk promo.
* Sorting harga termurah, harga tertinggi, dan diskon terbesar.

Setiap card promo menampilkan:

* Badge `PROMO`.
* Persentase diskon.
* Harga normal dicoret.
* Harga setelah diskon.
* Countdown promo.
* Stok tersedia.
* Tombol `Beli Sekarang`.

### 3. Sistem Promo Produk

Promo harus terhubung ke produk dan mendukung:

```text
Harga Normal
Harga Promo
Persentase Diskon
Tanggal Mulai
Tanggal Berakhir
Status Promo
Kuota/Stok Promo
```

Status promo:

```text
scheduled
active
expired
disabled
```

Harga yang tampil ke pelanggan harus otomatis menggunakan harga promo jika:

```text
status === active
tanggal sekarang >= tanggal mulai
tanggal sekarang <= tanggal berakhir
stok promo masih tersedia
```

Jika promo berakhir, sistem otomatis kembali ke harga normal.

### 4. Tampilan Promo yang Menarik

Gunakan desain modern e-commerce:

* Badge diskon.
* Countdown timer.
* Card produk dengan hover effect.
* Skeleton loading.
* Empty state jika tidak ada promo.
* Responsive grid.
* Mobile-first design.
* Dark mode jika aplikasi mendukung.
* Animasi ringan dan tidak berlebihan.

### 5. Integrasi dengan Keranjang

Jika pelanggan membeli produk promo:

* Harga promo harus tersimpan saat checkout.
* Jangan mengambil ulang harga normal jika promo berakhir setelah produk masuk cart.
* Simpan snapshot harga saat item ditambahkan ke cart.
* Saat checkout lakukan validasi ulang promo.
* Jika promo sudah habis atau expired sebelum pembayaran, tampilkan informasi kepada pelanggan dan update harga secara jelas.

### 6. Prioritas

Kerjakan dengan urutan:

1. Perbaiki error `Rendered more hooks than during the previous render`.
2. Pastikan halaman OrderDetailPage kembali normal.
3. Pastikan tidak ada hook yang dipanggil secara conditional.
4. Perbaiki warning yang menyebabkan aplikasi crash.
5. Baru implementasikan sistem promo.
6. Pastikan seluruh fitur responsive.
7. Jangan merusak fitur order, pembayaran, pengiriman, konfirmasi barang diterima, rating, dan ulasan yang sudah ada.

Gunakan struktur kode yang bersih, TypeScript type-safe, reusable component, dan jangan mengubah fitur existing yang tidak berkaitan.
