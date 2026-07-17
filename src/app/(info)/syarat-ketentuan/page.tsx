"use client";

import { useEffect } from "react";

function MaterialIcon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
      {children}
    </span>
  );
}

export default function SyaratKetentuanPage() {
  useEffect(() => {
    function handleScroll() {
      const sections = document.querySelectorAll("section[id]");
      const navLinks = document.querySelectorAll<HTMLAnchorElement>("aside nav ul li a");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id") || "";
        }
      });
      navLinks.forEach((link) => {
        link.classList.remove("text-[#1e3a8a]", "border-[#1e3a8a]");
        link.classList.add("text-[#475569]", "border-transparent");
        if (link.getAttribute("href")?.substring(1) === current) {
          link.classList.add("text-[#1e3a8a]", "border-[#1e3a8a]");
          link.classList.remove("text-[#475569]", "border-transparent");
        }
      });
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-16 md:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { vertical-align: middle; }
        .policy-content h2 {
          font-size: 24px; line-height: 32px; font-weight: 600;
          color: #0f172a; margin-top: 40px; margin-bottom: 16px;
          scroll-margin-top: 96px;
        }
        .policy-content h3 {
          font-size: 18px; line-height: 28px; font-weight: 600;
          color: #0f172a; margin-top: 24px; margin-bottom: 12px;
        }
        .policy-content p {
          font-size: 16px; line-height: 24px; font-weight: 400;
          color: #475569; margin-bottom: 16px;
        }
        .policy-content ul {
          list-style: disc; list-style-position: outside;
          margin-left: 24px; margin-bottom: 16px;
          color: #475569; font-size: 16px; line-height: 24px;
        }
        .policy-content ul li { margin-bottom: 8px; }
        .policy-content ul li strong { color: #0f172a; }
        .policy-content ol {
          list-style: decimal; list-style-position: outside;
          margin-left: 24px; margin-bottom: 16px;
          color: #475569; font-size: 16px; line-height: 24px;
        }
        .policy-content ol li { margin-bottom: 8px; padding-left: 8px; }
        .policy-content ol li strong { color: #0f172a; }
      `}</style>

      <div className="flex flex-col gap-16 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-4 text-[18px] font-semibold text-[#0f172a]">Daftar Isi</h3>
            <nav>
              <ul className="space-y-2">
                {[
                  { id: "pendahuluan", label: "1. Pendahuluan" },
                  { id: "cara-pemesanan", label: "2. Cara Memesannya" },
                  { id: "kebijakan-pengembalian", label: "3. Kebijakan Pengembalian" },
                  { id: "hak-kekayaan-intelektual", label: "4. Hak Kekayaan Intelektual" },
                  { id: "batasan-tanggung-jawab", label: "5. Batasan Tanggung Jawab" },
                  { id: "hubungi-kami", label: "6. Hubungi Kami" },
                ].map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block border-l-2 py-1 pl-4 text-sm font-semibold transition-colors ${
                        i === 0
                          ? "border-[#1e3a8a] text-[#1e3a8a]"
                          : "border-transparent text-[#475569] hover:text-[#1e3a8a]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <article className="flex-1 max-w-3xl">
          <header className="mb-16">
            <span className="mb-4 inline-block rounded-full bg-[#e0e7ff] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#1e3a8a]">
              Terakhir Diperbarui: 24 Mei 2024
            </span>
            <h1 className="mb-4 font-['Plus_Jakarta_Sans'] text-4xl font-bold leading-tight tracking-tight text-[#0f172a] md:text-5xl">
              Syarat &amp; Ketentuan
            </h1>
            <p className="font-['Inter'] text-lg leading-relaxed text-[#475569]">
              Dengan menggunakan platform Jernih Creative, Anda menyetujui syarat dan ketentuan yang berlaku. Harap baca dokumen ini dengan saksama.
            </p>
          </header>

          <div className="policy-content">
            <section id="pendahuluan">
              <h2>1. Pendahuluan</h2>
              <p>Selamat datang di Jernih Creative. Syarat dan Ketentuan ini mengatur penggunaan platform marketplace digital kami yang menyediakan produk kreatif, jasa desain, dan layanan sewa peralatan. Dengan mengakses atau menggunakan layanan Jernih Creative, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh syarat dan ketentuan yang tercantum di bawah ini.</p>
              <p>Jika Anda tidak menyetujui sebagian atau seluruh isi dari Syarat dan Ketentuan ini, mohon untuk tidak menggunakan layanan kami. Jernih Creative berhak untuk memperbarui atau mengubah Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku efektif segera setelah dipublikasikan di halaman ini.</p>
              <div className="my-6 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm italic text-[#475569]">
                <MaterialIcon className="mr-2 align-middle text-[#1e3a8a]">info</MaterialIcon>
                Dengan terus menggunakan platform setelah perubahan dipublikasikan, Anda dianggap telah menyetujui perubahan tersebut.
              </div>
            </section>

            <div className="my-10 overflow-hidden rounded-xl border border-[#cbd5e1]">
              <img
                className="h-80 w-full object-cover"
                alt="Workspace"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
              />
            </div>

            <section id="cara-pemesanan">
              <h2>2. Cara Memesannya</h2>
              <p>Proses pemesanan layanan atau produk di Jernih Creative dirancang agar mudah dan transparan. Berikut adalah langkah-langkah yang perlu Anda ikuti:</p>

              <div className="my-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">1</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Pilih Layanan</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Jelajahi katalog produk, jasa, atau sewa peralatan yang tersedia di platform kami. Gunakan fitur pencarian untuk menemukan apa yang Anda butuhkan.</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">2</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Konsultasi &amp; Konfirmasi</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Hubungi kami untuk mendiskusikan kebutuhan spesifik Anda. Tim kami akan memberikan penawaran harga dan estimasi waktu pengerjaan.</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">3</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Pembayaran &amp; Eksekusi</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Lakukan pembayaran sesuai dengan metode yang tersedia. Setelah pembayaran dikonfirmasi, tim kami akan segera memproses pesanan Anda.</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">4</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Revisi</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Untuk layanan jasa, Anda berhak mengajukan revisi sesuai dengan ketentuan yang telah disepakati sebelumnya dalam paket layanan yang Anda pilih.</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">5</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Selesai</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Setelah semua tahapan selesai, hasil pekerjaan akan diserahkan kepada Anda. Jangan lupa untuk memberikan ulasan dan rating!</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-sm font-bold text-white">6</div>
                  <h3 className="mb-2 text-base font-semibold text-[#0f172a]">Dukungan Purna Jual</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">Kami menyediakan layanan dukungan setelah pesanan selesai. Hubungi tim kami jika Anda memerlukan bantuan tambahan.</p>
                </div>
              </div>

              <p>Setiap pemesanan yang masuk akan mendapatkan nomor referensi unik. Harap simpan nomor referensi ini untuk memudahkan komunikasi dan pelacakan status pesanan Anda.</p>
            </section>

            <section id="kebijakan-pengembalian">
              <h2>3. Kebijakan Pengembalian</h2>
              <p>Kami ingin memastikan kepuasan Anda dalam menggunakan layanan Jernih Creative. Kebijakan pengembalian dana (refund) dan pembatalan pesanan berlaku sebagai berikut:</p>
              <ul>
                <li><strong>Produk Digital:</strong> Tidak dapat dikembalikan setelah file diunduh atau dikirimkan, kecuali terdapat cacat teknis dari pihak kami.</li>
                <li><strong>Jasa Desain:</strong> Pembatalan dapat dilakukan dalam waktu 1x24 jam setelah pemesanan dengan dikenakan biaya administrasi sebesar 20% dari total nilai pesanan.</li>
                <li><strong>Sewa Peralatan:</strong> Pembatalan paling lambat 3 hari sebelum jadwal penyewaan untuk mendapatkan pengembalian dana penuh. Pembatalan di bawah 3 hari akan dikenakan biaya 50%.</li>
                <li><strong>Produk Fisik:</strong> Dapat dikembalikan dalam waktu 7 hari setelah diterima dengan kondisi barang masih baru dan belum digunakan. Biaya pengiriman kembali ditanggung oleh pembeli.</li>
              </ul>
              <p>Pengembalian dana akan diproses dalam waktu 3x14 hari kerja setelah permohonan pengembalian disetujui dan akan dikembalikan melalui metode pembayaran yang sama saat pemesanan.</p>
            </section>

            <section id="hak-kekayaan-intelektual">
              <h2>4. Hak Kekayaan Intelektual</h2>
              <p>Seluruh konten yang tersedia di platform Jernih Creative, termasuk namun tidak terbatas pada teks, gambar, logo, video, dan desain, dilindungi oleh hak cipta dan undang-undang kekayaan intelektual yang berlaku.</p>
              <ul>
                <li><strong>Hak Cipta Platform:</strong> Semua elemen visual dan fungsionalitas platform Jernih Creative adalah milik Jernih Creative dan tidak boleh direproduksi tanpa izin tertulis.</li>
                <li><strong>Karya Pengguna:</strong> Karya yang diunggah oleh pengguna (desainer, kreator) tetap menjadi milik pengguna yang bersangkutan. Dengan mengunggah karya, pengguna memberikan lisensi kepada Jernih Creative untuk menampilkan dan mempromosikan karya tersebut di platform.</li>
                <li><strong>Hasil Proyek:</strong> Hak cipta atas hasil proyek yang dikerjakan melalui layanan jasa kami akan dialihkan kepada pembeli setelah pembayaran lunas, kecuali disepakati lain dalam kontrak terpisah.</li>
              </ul>
              <p>Pelanggaran terhadap hak kekayaan intelektual akan ditindak tegas sesuai dengan hukum yang berlaku.</p>
            </section>

            <section id="batasan-tanggung-jawab">
              <h2>5. Batasan Tanggung Jawab</h2>
              <p>Jernih Creative tidak bertanggung jawab atas:</p>
              <ul>
                <li>Kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.</li>
                <li>Keterlambatan atau kegagalan dalam memberikan layanan yang disebabkan oleh force majeure, termasuk bencana alam, pemadaman listrik, gangguan internet, atau kebijakan pemerintah.</li>
                <li>Akurasi, kelengkapan, atau keandalan konten yang diunggah oleh pengguna pihak ketiga di platform marketplace kami.</li>
                <li>Kerusakan data atau kehilangan informasi yang diakibatkan oleh tindakan pengguna yang lalai dalam menjaga keamanan akun mereka.</li>
              </ul>
              <p>Total tanggung jawab Jernih Creative dalam segala hal tidak akan melebihi jumlah yang dibayarkan oleh pengguna untuk layanan tertentu dalam 3 bulan terakhir.</p>
              <div className="my-6 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-6 italic text-[#475569]">
                <MaterialIcon className="mr-2 align-middle text-[#1e3a8a]">gavel</MaterialIcon>
                Pengguna setuju untuk membebaskan Jernih Creative dari tuntutan hukum atau klaim pihak ketiga yang timbul akibat pelanggaran Syarat dan Ketentuan ini oleh pengguna.
              </div>
            </section>

            <section id="hubungi-kami">
              <h2>6. Hubungi Kami</h2>
              <p>Jika Anda memiliki pertanyaan, keluhan, atau memerlukan klarifikasi lebih lanjut mengenai Syarat dan Ketentuan ini, jangan ragu untuk menghubungi kami melalui saluran berikut:</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 text-[#0f172a]">
                  <MaterialIcon className="text-[#1e3a8a]">mail</MaterialIcon>
                  <span>legal@jernihcreative.com</span>
                </div>
                <div className="flex items-center gap-4 text-[#0f172a]">
                  <MaterialIcon className="text-[#1e3a8a]">phone</MaterialIcon>
                  <span>+62 812-3456-7890</span>
                </div>
                <div className="flex items-center gap-4 text-[#0f172a]">
                  <MaterialIcon className="text-[#1e3a8a]">location_on</MaterialIcon>
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
              <div className="mt-8 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-8 text-center">
                <h3 className="mb-4 text-lg font-semibold text-[#0f172a]">Siap Memulai Proyek Anda?</h3>
                <p className="mb-6 text-base text-[#475569]">Tim kami siap membantu mewujudkan ide kreatif Anda. Hubungi kami sekarang untuk konsultasi gratis!</p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e3a8a]/90"
                >
                  <MaterialIcon>arrow_forward</MaterialIcon>
                  Kembali ke Toko
                </a>
              </div>
            </section>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-[#cbd5e1] pt-10">
            <p className="text-sm text-[#475569]">Apakah informasi ini membantu?</p>
            <div className="flex gap-4">
              <button className="rounded-lg border border-[#94a3b8] px-4 py-2 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#e2e8f0]">Ya, membantu</button>
              <button className="rounded-lg border border-[#94a3b8] px-4 py-2 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#e2e8f0]">Tidak</button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
