"use client";

import { useEffect } from "react";

function MaterialIcon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
      {children}
    </span>
  );
}

export default function KebijakanPrivasiPage() {
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
      `}</style>

      <div className="flex flex-col gap-16 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-4 text-[18px] font-semibold text-[#0f172a]">Daftar Isi</h3>
            <ul className="space-y-2">
              {[
                { id: "pendahuluan", label: "Pendahuluan" },
                { id: "pengumpulan-data", label: "Pengumpulan Data" },
                { id: "penggunaan-informasi", label: "Penggunaan Informasi" },
                { id: "keamanan", label: "Keamanan" },
                { id: "hak-pengguna", label: "Hak Pengguna" },
                { id: "hubungi-kami", label: "Hubungi Kami" },
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
          </div>
        </aside>

        <article className="flex-1 max-w-3xl">
          <header className="mb-16">
            <span className="mb-4 inline-block rounded-full bg-[#e0e7ff] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#1e3a8a]">
              Terakhir Diperbarui: 24 Mei 2024
            </span>
            <h1 className="mb-4 font-['Plus_Jakarta_Sans'] text-4xl font-bold leading-tight tracking-tight text-[#0f172a] md:text-5xl">
              Kebijakan Privasi
            </h1>
            <p className="font-['Inter'] text-lg leading-relaxed text-[#475569]">
              Di Jernih Creative, kami menghargai transparansi dan privasi Anda. Dokumen ini menjelaskan bagaimana kami mengelola informasi Anda dengan penuh tanggung jawab.
            </p>
          </header>

          <div className="policy-content">
            <section id="pendahuluan">
              <h2>Pendahuluan</h2>
              <p>Selamat datang di Jernih Creative. Kebijakan Privasi ini dirancang untuk membantu Anda memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi yang Anda berikan kepada kami melalui platform marketplace kreatif kami.</p>
              <p>Dengan menggunakan layanan Jernih Creative, Anda menyetujui praktik data yang dijelaskan dalam kebijakan ini. Kami berkomitmen untuk memastikan bahwa privasi Anda terlindungi sesuai dengan standar industri tertinggi.</p>
            </section>

            <div className="my-10 overflow-hidden rounded-xl border border-[#cbd5e1]">
              <img className="h-80 w-full object-cover" alt="Workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFhMzq2JzxMKfFlQrjS1CdAMKIxET02o1x_HbWVCRSX5HTY8aVQhsGFWHHvMOxaMWCr0-bnq2YwYyPE6oxw1Ha2nQvD6xA_ZpqjFf51n4TmRrNZsBh45QYqxRkRV_Pbq3U0V-xxq3uz79-q4krWtgDJNn5AQhJCUxFFx4dsklXQNQ2a2_V-GWIJ_K3iGh0vDvO37N24OzJi85eesoMJBSnIx8kRUosK_m7ZB6RxoQ74gJYuPjUPg-3" />
            </div>

            <section id="pengumpulan-data">
              <h2>Pengumpulan Data</h2>
              <p>Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami kepada Anda:</p>
              <ul>
                <li><strong>Informasi Identitas Pribadi:</strong> Nama, alamat email, nomor telepon, dan detail kontak lainnya saat Anda mendaftar akun.</li>
                <li><strong>Informasi Transaksi:</strong> Detail pembayaran (diproses melalui penyedia pihak ketiga yang aman), riwayat pembelian, dan layanan yang Anda sewa atau beli.</li>
                <li><strong>Data Teknis:</strong> Alamat IP, jenis browser, data lokasi geografis dasar, dan interaksi Anda dengan situs web kami melalui cookie.</li>
                <li><strong>Konten Kreatif:</strong> Informasi yang Anda unggah sebagai bagian dari portofolio atau permintaan layanan di marketplace kami.</li>
              </ul>
            </section>

            <section id="penggunaan-informasi">
              <h2>Penggunaan Informasi</h2>
              <p>Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
              <ul>
                <li>Memfasilitasi transaksi antara pembeli, penyedia layanan, dan mitra di ekosistem Jernih Creative.</li>
                <li>Memberikan dukungan pelanggan dan menanggapi permintaan atau pertanyaan Anda secara tepat waktu.</li>
                <li>Menganalisis penggunaan platform untuk meningkatkan antarmuka pengguna dan pengalaman navigasi (analitik anonim).</li>
                <li>Mengirimkan pembaruan layanan, buletin kreatif, atau informasi promosi jika Anda telah memberikan persetujuan.</li>
              </ul>
            </section>

            <section id="keamanan">
              <h2>Keamanan Data</h2>
              <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang ketat untuk melindungi data Anda dari akses yang tidak sah, perubahan, pengungkapan, atau penghancuran. Ini termasuk:</p>
              <p>Penggunaan enkripsi SSL (Secure Sockets Layer) untuk semua transmisi data sensitif, audit keamanan rutin pada infrastruktur server kami, dan pembatasan akses data hanya kepada personel yang memerlukannya untuk menjalankan tugas mereka.</p>
              <div className="my-6 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-6 italic text-[#475569]">
                &ldquo;Keamanan data Anda adalah prioritas utama kami. Kami tidak pernah menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.&rdquo;
              </div>
            </section>

            <section id="hak-pengguna">
              <h2>Hak Pengguna</h2>
              <p>Sebagai pengguna Jernih Creative, Anda memiliki hak-hak berikut terkait data Anda:</p>
              <ul>
                <li><strong>Hak Akses:</strong> Anda dapat meminta salinan data pribadi yang kami simpan tentang Anda.</li>
                <li><strong>Hak Koreksi:</strong> Anda dapat memperbarui atau memperbaiki informasi yang tidak akurat melalui pengaturan profil Anda.</li>
                <li><strong>Hak Penghapusan:</strong> Anda dapat meminta penghapusan akun dan data terkait Anda, sesuai dengan kewajiban hukum penyimpanan data tertentu.</li>
                <li><strong>Hak Penarikan Persetujuan:</strong> Anda dapat berhenti berlangganan dari komunikasi pemasaran kami kapan saja.</li>
              </ul>
            </section>

            <section id="hubungi-kami">
              <h2>Hubungi Kami</h2>
              <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau praktik privasi kami, silakan hubungi tim kepatuhan kami di:</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 text-[#0f172a]">
                  <MaterialIcon className="text-[#1e3a8a]">mail</MaterialIcon>
                  <span>privacy@jernihcreative.com</span>
                </div>
                <div className="flex items-center gap-4 text-[#0f172a]">
                  <MaterialIcon className="text-[#1e3a8a]">location_on</MaterialIcon>
                  <span>Jakarta, Indonesia</span>
                </div>
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
