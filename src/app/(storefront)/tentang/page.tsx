import Link from "next/link";

export const metadata = {
  title: "Tentang Kami - Jernih Creative",
  description: "Tentang ekosistem kreatif Jernih Creative untuk produk, jasa, sewa, dan kemitraan profesional.",
};

const heroImage = "https://lh3.googleusercontent.com/aida/AP1WRLuwt28TdsBFtd2WTVIi7lmRf_y0DoFIMfB2O2ROfeaeYIUnPGPhzpd8fYckXmmJHyHSZqGfOd3epLfEf9DDAhy7QeusseGhThjj2z4ExnLipSKtBdAXAPTUKACdwsJWLv6yC1SKFWULiQ31tcBEQdWEPoAIUPAMIsvdogFvI5Ckl9i7K8sY2aGKVjot4g1kpAbDcoqLniwCaMsp3tkmwzHpMnl7RGrU-ZTCovJ_yCnsq9eXkERa2K9fvAo";

const services = [
  {
    icon: "shopping_bag",
    title: "Produk Fisik & Digital",
    description: "Marketplace kurasi tinggi untuk aset digital, template, hingga karya fisik berkualitas dari kreator terpilih.",
    offset: "md:mt-12",
  },
  {
    icon: "design_services",
    title: "Layanan Profesional",
    description: "Akses langsung ke talenta kreatif profesional untuk project desain, pengembangan, dan strategi brand Anda.",
    offset: "",
  },
  {
    icon: "key",
    title: "Layanan Sewa",
    description: "Penyewaan perlengkapan produksi, studio, dan aset kreatif lainnya dengan proses yang aman dan transparan.",
    offset: "md:mt-12",
  },
  {
    icon: "storefront",
    title: "Transaksi Mitra",
    description: "Fasilitas transaksi B2B terpercaya, mendukung kolaborasi skala besar dengan manajemen yang rapi dan terukur.",
    offset: "",
  },
];

const commitments = [
  { icon: "shield", title: "Keamanan", description: "Perlindungan data dan transaksi di setiap lapisan.", offset: "" },
  { icon: "verified_user", title: "Kepercayaan", description: "Sistem reputasi yang adil dan validasi terpusat.", offset: "md:-mt-8" },
  { icon: "trending_up", title: "Pertumbuhan", description: "Fokus pada peningkatan skala bisnis seluruh pengguna.", offset: "" },
  { icon: "visibility", title: "Transparansi", description: "Komunikasi terbuka tanpa biaya tersembunyi.", offset: "md:-mt-8" },
  { icon: "lightbulb", title: "Inovasi", description: "Pembaruan fitur berkelanjutan untuk efisiensi.", offset: "" },
];

const partnerBenefits = [
  "Proses onboarding yang jelas dan terstruktur.",
  "Dukungan visibilitas di pasar yang relevan.",
  "Sistem pembayaran yang aman dan tepat waktu.",
];

function MaterialIcon({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

export default function TentangPage() {
  return (
    <main className="bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=block');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 500; vertical-align:middle; }
        .about-reveal { animation: aboutReveal 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .about-float { animation: aboutFloat 8s ease-in-out infinite; }
        @keyframes aboutReveal { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes aboutFloat { 0%, 100% { transform: translateY(-50%) rotate(0deg); } 50% { transform: translateY(-54%) rotate(12deg); } }
      `}</style>

      <section className="relative flex min-h-[90vh] w-full items-center overflow-hidden border-b border-[#e1e3e4]/20 bg-[#2d3133]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Jernih Creative Team" className="h-full w-full object-cover opacity-60 mix-blend-overlay" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d3133] via-[#2d3133]/80 to-transparent" />
        </div>
        <div className="about-float pointer-events-none absolute right-[-10%] top-1/2 z-[1] h-[60vw] max-h-[620px] w-[60vw] max-w-[620px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-[#064e3b]/40 opacity-40 blur-2xl lg:right-[4%] lg:h-[40vw] lg:w-[40vw] lg:opacity-70" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-24 md:px-8 lg:py-[120px]">
          <div className="about-reveal w-full lg:w-2/3">
            <span className="mb-6 inline-block rounded-full border border-[#064e3b]/30 bg-[#064e3b]/20 px-4 py-2 text-[14px] font-bold uppercase tracking-widest text-[#b0f0d6] shadow-lg backdrop-blur-md">
              Ekosistem Kreatif
            </span>
            <h1 className="mb-6 font-['Plus_Jakarta_Sans'] text-6xl font-black leading-[1.05] tracking-tighter text-white md:text-8xl lg:text-[110px]">
              Tentang <br /><span className="text-[#b0f0d6]">Kami</span>
            </h1>
            <p className="max-w-2xl font-['Inter'] text-xl font-light leading-relaxed text-[#eff1f3] drop-shadow-md md:text-2xl">
              Jernih Creative adalah platform ekosistem kreatif terpercaya yang menghubungkan pelanggan, penjual, penyedia layanan, dan mitra dalam satu lingkungan yang transparan dan profesional.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-8 lg:py-32">
        <div className="absolute right-0 top-0 -z-10 h-full w-1/3 rounded-l-full bg-gradient-to-l from-[#f2f4f6] to-transparent opacity-50" />
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          <div className="about-reveal lg:sticky lg:top-32 lg:col-span-5">
            <h2 className="mb-4 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-tight text-[#191c1d] md:text-5xl">
              Apa yang Kami Sediakan
            </h2>
            <p className="mb-10 font-['Inter'] text-xl font-light text-[#404944]">Solusi komprehensif untuk setiap kebutuhan kreatif Anda.</p>
            <div className="h-1 w-24 rounded-full bg-[#064e3b]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
            {services.map((service, index) => (
              <div key={service.title} className={`about-reveal rounded-3xl border border-[#e1e3e4]/30 bg-white p-10 shadow-lg shadow-[#064e3b]/5 transition-all duration-300 hover:-translate-y-2 hover:border-[#064e3b]/30 hover:shadow-2xl hover:shadow-[#064e3b]/10 ${service.offset}`} style={{ animationDelay: `${100 + index * 100}ms` }}>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#064e3b]/10 text-[#003527]">
                  <MaterialIcon className="text-3xl">{service.icon}</MaterialIcon>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#191c1d]">{service.title}</h3>
                <p className="font-['Inter'] leading-relaxed text-[#404944]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden bg-white px-4 py-24 md:px-8 lg:py-32">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-20 lg:flex-row">
          <div className="about-reveal relative w-full lg:w-1/2">
            <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[40px] bg-[#064e3b]/10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Ruang kerja kolaboratif" className="aspect-[4/5] h-auto w-full rounded-[40px] object-cover object-center shadow-2xl" src={heroImage} />
            <div className="absolute -bottom-8 -right-8 hidden rounded-3xl border border-[#e1e3e4]/20 bg-white p-6 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#003527]"><MaterialIcon>handshake</MaterialIcon></div>
                <div><p className="text-lg font-bold">Kolaborasi</p><p className="text-sm text-[#404944]">Tumbuh Bersama</p></div>
              </div>
            </div>
          </div>
          <div className="about-reveal w-full lg:w-1/2" style={{ animationDelay: "200ms" }}>
            <div className="lg:pl-10">
              <span className="mb-6 inline-block rounded-full border border-[#064e3b]/20 bg-[#064e3b]/10 px-4 py-2 text-[14px] font-bold uppercase tracking-widest text-[#003527]">Peluang Tumbuh</span>
              <h2 className="mb-6 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-tight text-[#191c1d] md:text-5xl">Menjadi Mitra Jernih Creative</h2>
              <p className="mb-16 font-['Inter'] text-xl font-light leading-relaxed text-[#404944]">Kami membuka pintu lebar bagi individu berbakat, UKM kreatif, hingga perusahaan besar untuk bergabung dan tumbuh bersama dalam ekosistem kami.</p>
              <ul className="flex flex-col gap-6">
                {partnerBenefits.map((benefit) => (
                  <li key={benefit} className="group flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#003527] transition-colors duration-300 group-hover:bg-[#064e3b] group-hover:text-white"><MaterialIcon className="text-[20px]">check</MaterialIcon></div>
                    <span className="text-lg font-medium leading-relaxed text-[#191c1d] transition-colors group-hover:text-[#003527]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-8 lg:py-32">
        <div className="about-reveal mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-[#191c1d] md:text-5xl">Komitmen Kami</h2>
          <p className="font-['Inter'] text-xl font-light text-[#404944]">Fondasi dari setiap interaksi di platform Jernih Creative.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 lg:grid-cols-5">
          {commitments.map((item, index) => (
            <div key={item.title} className={`about-reveal group flex flex-col items-center rounded-[32px] border border-[#e1e3e4]/20 bg-white p-10 text-center shadow-lg shadow-[#064e3b]/5 transition-all duration-300 hover:-translate-y-2 hover:border-[#064e3b]/30 hover:shadow-2xl hover:shadow-[#064e3b]/10 ${item.offset}`} style={{ animationDelay: `${100 + index * 100}ms` }}>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#064e3b]/5 text-[#003527] transition-all duration-500 group-hover:rotate-12 group-hover:bg-[#064e3b] group-hover:text-white">
                <MaterialIcon className="text-4xl">{item.icon}</MaterialIcon>
              </div>
              <h4 className="mb-2 text-xl font-bold text-[#191c1d]">{item.title}</h4>
              <p className="text-sm leading-relaxed text-[#404944]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-16 max-w-[1280px] px-4 py-24 text-center md:px-8">
        <div className="about-reveal relative overflow-hidden rounded-[40px] bg-[#2d3133] p-10 shadow-2xl md:p-[100px]">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#064e3b] via-[#064e3b]/80 to-[#003527] opacity-95" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-[#064e3b]/20 blur-[120px]" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">Masa Depan Kreatif</span>
            <h2 className="mb-10 font-['Plus_Jakarta_Sans'] text-4xl font-black leading-[1.1] tracking-tighter text-white md:text-6xl lg:text-7xl">Bersama Membangun <br />Ekosistem yang Lebih Baik</h2>
            <p className="mx-auto mb-16 max-w-3xl text-lg font-light leading-[1.8] text-white/80 md:text-xl">Jernih Creative bukan sekadar platform; ini adalah komunitas yang didorong oleh kolaborasi dan dedikasi terhadap kualitas.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register-mitra" className="inline-flex items-center justify-center rounded-full bg-white px-10 py-6 text-lg font-bold text-[#003527] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                Mulai Perjalanan Anda <MaterialIcon className="ml-2 transition-transform">arrow_forward</MaterialIcon>
              </Link>
              <Link href="/register-mitra" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-10 py-6 text-lg font-bold text-white transition-all duration-300 hover:bg-white/10">
                Pelajari Kemitraan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
