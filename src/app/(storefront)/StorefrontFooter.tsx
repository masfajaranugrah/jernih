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

export default function StorefrontFooter() {
  return (
    <footer className="w-full bg-white">
      {/* ── About ── */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-bold text-black md:text-2xl">Jernih Kreatif</h2>
            <p className="mt-1 text-sm text-[#64748b]">Solusi Belanja, Sewa, dan Jasa dalam Satu Tempat</p>
            <div className="mx-auto mt-6 max-w-3xl space-y-3 text-left text-xs leading-relaxed text-[#475569]">
              <p>Selamat datang di Jernih Kreatif, platform marketplace yang menghadirkan pengalaman berbelanja, menyewa, dan mencari jasa dengan mudah, aman, serta harga yang terjangkau.</p>
              <p>Di Jernih Kreatif, Anda dapat menemukan beragam produk berkualitas untuk memenuhi kebutuhan sehari hari, perlengkapan rumah tangga, elektronik, gadget, komputer, fashion, hobi, perlengkapan usaha, hingga berbagai kategori produk lainnya. Selain itu, kami juga menghadirkan layanan sewa serta berbagai jasa profesional yang siap membantu kebutuhan pribadi maupun bisnis Anda.</p>
              <p>Tak hanya menjadi tempat bertransaksi, Jernih Kreatif juga menjadi wadah bagi UMKM, pelaku usaha, distributor, maupun individu untuk memasarkan produk dan layanan kepada lebih banyak pelanggan di seluruh Indonesia.</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-black">Semua kebutuhan Anda, dalam satu platform terpercaya.</p>
          </div>
        </div>
      </section>

      {/* ── Mengapa ── */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-12">
          <div className="text-center">
            <h2 className="text-lg font-bold text-black md:text-xl">Mengapa Memilih Jernih Kreatif?</h2>
            <p className="mt-1 text-xs text-[#64748b]">Kenapa Harus Jernih Kreatif?</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "💰", title: "Harga Terjangkau", desc: "Kami menghadirkan berbagai produk dengan harga yang kompetitif sehingga Anda dapat berbelanja lebih hemat tanpa mengorbankan kualitas." },
              { icon: "✅", title: "Produk Berkualitas", desc: "Setiap penjual didorong untuk menyediakan produk terbaik dengan informasi yang jelas dan transparan agar pelanggan dapat berbelanja dengan nyaman dan percaya diri." },
              { icon: "🚚", title: "Belanja Mudah & Praktis", desc: "Nikmati proses belanja yang sederhana, pencarian produk yang cepat, serta sistem transaksi yang aman sehingga pengalaman berbelanja menjadi lebih nyaman." },
              { icon: "🛠️", title: "Sewa & Jasa Satu Platform", desc: "Tidak hanya menjual produk, Jernih Kreatif juga menyediakan berbagai layanan sewa dan jasa profesional. Mulai dari kebutuhan event, peralatan, hingga jasa kreatif dan teknis." },
              { icon: "🛍️", title: "Kesempatan Jadi Penjual", desc: "Ingin mengembangkan bisnis? Buka toko Anda di Jernih Kreatif dan pasarkan produk maupun jasa kepada ribuan calon pelanggan dengan platform yang mudah digunakan." },
              { icon: "📈", title: "Dukung UMKM", desc: "Jernih Kreatif berkomitmen membantu UMKM, pelaku usaha lokal, dan kreator Indonesia berkembang melalui platform digital yang mudah diakses, terpercaya, dan terus bertumbuh." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-black">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#475569]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-3xl border-t border-[#e2e8f0] pt-8 text-center">
            <h3 className="text-base font-bold text-black">Mulai Bersama Jernih Kreatif</h3>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-[#475569]">Baik Anda ingin berbelanja, menyewa, menggunakan jasa profesional, maupun membuka toko dan menjual produk, Jernih Kreatif adalah solusi yang tepat.</p>
            <p className="mt-2 text-xs leading-relaxed text-[#475569]">Bergabunglah bersama kami dan rasakan pengalaman marketplace yang lebih lengkap, praktis, dan menguntungkan.</p>
            <p className="mt-4 text-xs font-bold text-black">Jernih Kreatif Belanja Mudah, Harga Bersahabat, Peluang Usaha Tanpa Batas.</p>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">Transparan</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[#475569]">Temukan Produk dari Ribuan Toko / Online Shop terpercaya di Indonesia, dan baca review nya di Jernih Kreatif</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#475569]">Pembayaran Anda baru diteruskan ke penjual setelah barang Anda terima</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#475569]">Belanja Online Aman, Bebas Penipuan di Jernih Kreatif</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">Aman</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[#475569]">Bandingkan review untuk berbagai online shop terpercaya di Indonesia</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#475569]">Belanja produk apa saja di Jernih Kreatif, gratis tanpa biaya tambahan</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-black">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">Fasilitas Escrow Gratis</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[#475569]">Fasilitas Escrow (Rekening Bersama) Jernih Kreatif tidak dikenakan biaya tambahan</p>
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
              <div className="flex gap-4 pt-2">
                <Image src="/img/sosmed/facebook-color-svgrepo-com.svg" alt="Facebook" width={28} height={28} className="h-7 w-7 object-contain transition-opacity hover:opacity-70" unoptimized />
                <Image src="/img/sosmed/instagram-1-svgrepo-com.svg" alt="Instagram" width={28} height={28} className="h-7 w-7 object-contain transition-opacity hover:opacity-70" unoptimized />
                <Image src="/img/sosmed/tiktok-logo-logo-svgrepo-com.svg" alt="TikTok" width={28} height={28} className="h-7 w-7 object-contain transition-opacity hover:opacity-70" unoptimized />
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
