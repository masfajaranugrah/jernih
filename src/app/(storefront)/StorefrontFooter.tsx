import Image from "next/image";
import Link from "next/link";

const companyLinks = [
  { label: "Services", href: "/jasa" },
  { label: "Products", href: "/produk" },
  { label: "About Us", href: "/tentang" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/kebijakan-privasi" },
  { label: "Terms of Service", href: "/syarat-ketentuan" },
];

const paymentMethods = [
  { src: "/pyment/bca.png.webp", label: "BCA" },
  { src: "/pyment/mandiri.png.webp", label: "Mandiri" },
  { src: "/pyment/bni.png.webp", label: "BNI" },
  { src: "/pyment/cimb-niaga.png.webp", label: "CIMB Niaga" },
  { src: "/pyment/permata-2.png.webp", label: "Permata" },
  { src: "/pyment/visa.png.webp", label: "Visa" },
  { src: "/pyment/mastercard.png.webp", label: "Mastercard" },
  { src: "/pyment/jcb.png.webp", label: "JCB" },
  { src: "/pyment/gopay.png.webp", label: "GoPay" },
  { src: "/pyment/dana.png.webp", label: "DANA" },
  { src: "/pyment/ovo-2.png.webp", label: "OVO" },
  { src: "/pyment/linkaja.png.webp", label: "LinkAja" },
  { src: "/pyment/sakuku.png.webp", label: "SakuKu" },
  { src: "/pyment/jenius.png.webp", label: "Jenius" },
  { src: "/pyment/kredivo.png.webp", label: "Kredivo" },
  { src: "/pyment/home-credit.png.webp", label: "Home Credit" },
  { src: "/pyment/alfamart-2.png.webp", label: "Alfamart" },
  { src: "/pyment/indomaret-footer-2.png.webp", label: "Indomaret" },
  { src: "/pyment/oneklik.png.webp", label: "OneKlik" },
];

const shippingMethods = [
  { src: "/pyment/JNE.png.webp", label: "JNE" },
  { src: "/pyment/JnT.png.webp", label: "J&T" },
  { src: "/pyment/Sicepat.png.webp", label: "SiCepat" },
  { src: "/pyment/Gosend.png.webp", label: "GoSend" },
  { src: "/pyment/Wahana.png.webp", label: "Wahana" },
  { src: "/pyment/Anteraja.png.webp", label: "Anteraja" },
];

const socialLinks = [
  { src: "/img/sosmed/facebook-color-svgrepo-com.svg", alt: "Facebook" },
  { src: "/img/sosmed/instagram-1-svgrepo-com.svg", alt: "Instagram" },
  { src: "/img/sosmed/tiktok-logo-logo-svgrepo-com.svg", alt: "TikTok" },
];

export default function StorefrontFooter() {
  return (
    <footer className="w-full bg-white">
      {/* ── Tentang ── */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 md:py-14">
          <h2 className="text-lg font-bold text-black mb-4">Tentang Jernih Kreatif</h2>
          <p className="text-sm leading-7 text-neutral-600 text-justify">
            Jernih Kreatif adalah platform marketplace yang membantu pelanggan menemukan produk, layanan sewa, dan jasa profesional dengan proses yang mudah, aman, dan transparan. Melalui satu ekosistem digital, pelanggan dapat mencari kebutuhan rumah tangga, elektronik, gadget, komputer, fashion, hobi, perlengkapan usaha, layanan sewa, hingga jasa kreatif dan teknis. Jernih Kreatif juga menjadi wadah bagi UMKM, pelaku usaha, distributor, penyedia jasa, dan individu untuk memasarkan produk maupun layanan kepada pelanggan di Indonesia. Platform ini mencakup marketplace produk dari berbagai kategori, layanan sewa untuk kebutuhan personal, event, dan usaha, jasa profesional untuk kebutuhan kreatif, teknis, dan bisnis, serta peluang pemasaran digital untuk UMKM dan pelaku usaha lokal. Semua kebutuhan Anda, dalam satu platform terpercaya.
          </p>
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#2563eb]">Mengapa Memilih Kami</p>
            <h2 className="mt-2 text-xl font-extrabold text-black md:text-2xl">Dibangun untuk transaksi yang praktis, jelas, dan mendukung pertumbuhan usaha.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Harga Kompetitif", desc: "Pelanggan dapat membandingkan pilihan produk dan layanan dengan harga yang lebih terjangkau tanpa mengabaikan kualitas." },
              { title: "Informasi Produk Jelas", desc: "Setiap penjual didorong menampilkan informasi produk, layanan, harga, dan ketentuan secara transparan agar pelanggan dapat mengambil keputusan dengan percaya diri." },
              { title: "Belanja Lebih Praktis", desc: "Alur pencarian, pemesanan, dan transaksi dibuat sederhana agar kebutuhan pelanggan dapat diproses lebih cepat dan nyaman." },
              { title: "Sewa & Jasa Terintegrasi", desc: "Tidak hanya produk, Jernih Kreatif juga menyediakan layanan sewa dan jasa profesional untuk kebutuhan pribadi maupun bisnis." },
              { title: "Kesempatan Menjadi Penjual", desc: "Pelaku usaha dapat membuka toko, menawarkan jasa, atau memasarkan layanan sewa melalui platform yang mudah digunakan." },
              { title: "Dukungan untuk UMKM", desc: "Jernih Kreatif berkomitmen membantu UMKM, usaha lokal, dan kreator Indonesia memperluas jangkauan pasar melalui kanal digital." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <p className="text-sm font-extrabold text-black">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#475569] text-justify">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-black px-6 py-6 text-white md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h3 className="text-base font-extrabold">Mulai bersama Jernih Kreatif</h3>
              <p className="mt-1 text-sm leading-6 text-white/75">Belanja mudah, harga bersahabat, dan peluang usaha tanpa batas.</p>
            </div>
            <Link href="/register-mitra" className="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-black transition hover:bg-[#e2e8f0] md:mt-0">
              Daftar Mitra
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust & Legal ── */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#2563eb]">Keamanan & Transparansi</p>
            <h2 className="mt-2 text-xl font-extrabold text-black md:text-2xl">Prinsip layanan untuk pengalaman transaksi yang lebih aman.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black">Transparan</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569] text-justify">Informasi toko, produk, harga, ulasan, dan ketentuan layanan disajikan secara jelas agar pelanggan dapat membandingkan pilihan sebelum bertransaksi.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black">Aman</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569] text-justify">Sistem transaksi dirancang untuk membantu mengurangi risiko penipuan, menjaga alur pembayaran, dan memberi pelanggan pengalaman belanja yang lebih terlindungi.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black">Rekening Bersama</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569] text-justify">Dana pelanggan dapat dikelola melalui mekanisme rekening bersama sesuai ketentuan platform, sehingga pembayaran diteruskan setelah transaksi memenuhi ketentuan yang berlaku.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t-2 border-dashed border-[#cbd5e1]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4 md:px-12 md:py-20">
          <div className="space-y-6">
            <div className="text-2xl font-extrabold tracking-tight text-black">Jernih Creative</div>
            <p className="max-w-sm text-base leading-7 text-[#475569]">
              Menyediakan segala produk, jasa, dan layanan sewa untuk kebutuhan kreatif Anda.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-black">Perusahaan</h4>
            <nav className="flex flex-col gap-3" aria-label="Footer perusahaan">
              {companyLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-base font-bold text-[#475569] transition-colors hover:text-black">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-black">Legal</h4>
            <nav className="flex flex-col gap-3" aria-label="Footer legal">
              {legalLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-base font-bold text-[#475569] transition-colors hover:text-black">
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                {socialLinks.map((item) => (
                  <span
                    key={item.alt}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e2e8f0] bg-[#f8fafc] transition-colors hover:bg-[#e2e8f0]"
                    title={item.alt}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={22}
                      height={22}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </span>
                ))}
              </div>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-black">Metode Pembayaran</h4>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((item) => (
                <Image
                  key={item.label}
                  src={item.src}
                  alt={item.label}
                  width={48}
                  height={32}
                  className="h-8 w-auto rounded border border-[#e2e8f0] bg-white object-contain"
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="w-full overflow-hidden" style={{ filter: 'grayscale(100%)' }}>
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=95.293%2C-10.706%2C141.855%2C5.910&amp;layer=mapnik"
            width="100%"
            height="200"
            style={{ border: 0, display: 'block' }}
            title="Peta Indonesia"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="border-t border-[#e2e8f0]">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-12">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#94a3b8]">Pengiriman</span>
              {shippingMethods.map((item) => (
                <Image
                  key={item.label}
                  src={item.src}
                  alt={item.label}
                  width={48}
                  height={32}
                  className="h-7 w-auto rounded border border-[#e2e8f0] bg-white object-contain"
                  unoptimized
                />
              ))}
            </div>
            <div className="text-xs font-medium text-[#94a3b8]">Jernih Creative © 2026</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
