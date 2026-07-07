import Image from "next/image";
import Link from "next/link";
import DashboardSidebar from "./DashboardSidebar";

export const metadata = {
  title: "Dashboard - Jernih Creatife",
  description: "Dashboard Admin.",
};

// ── Data ────────────────────────────────────────────────────────────────────
const stats = [
  {
    icon: "package",
    label: "Total Pesanan",
    value: "128",
    badge: "+2 bulan ini",
    badgeColor: "bg-[#b0f0d6] text-[#002117]",
    dark: false,
  },
  {
    icon: "confirmation_number",
    label: "Voucher Aktif",
    value: "12",
    badge: "4 Kadaluarsa",
    badgeColor: "bg-[#ffdad6] text-[#93000a]",
    dark: false,
  },
  {
    icon: "favorite",
    label: "Wishlist Items",
    value: "45",
    badge: null,
    badgeColor: "",
    dark: false,
  },
  {
    icon: "account_balance_wallet",
    label: "Saldo & Poin",
    value: "Rp 2.450.000",
    badge: "Member Gold",
    badgeColor: "bg-[#064e3b] text-[#80bea6]",
    dark: true,
  },
];

const orderStatuses = [
  { icon: "payments", label: "Belum Bayar", count: 2, countColor: "bg-[#ba1a1a]" },
  { icon: "inventory_2", label: "Diproses", count: 1, countColor: "bg-[#003527]" },
  { icon: "local_shipping", label: "Dikirim", count: 3, countColor: "bg-[#003527]" },
  { icon: "task_alt", label: "Selesai", count: null, countColor: "" },
];

const recentOrders = [
  {
    id: "#ORD-2023-8912",
    product: "Sony WH-1000XM5 Wireless Headphones",
    date: "24 Okt 2023",
    status: "Selesai",
    statusColor: "bg-[#b0f0d6] text-[#002117]",
    total: "Rp 4.500.000",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHc6mvApVIi7J9h57dXfxvOer2F96wRdEyYIOVAAkxNQsGBC7ayBAmW72tRRBSFtymWpm12zR4M6rOcOKKDxmBLtlO9Dy8cuhyrkMCul7phHSgCEoxoXxsOm5I6UE1eQ7JkR_fGoZ7flwKcme2Il4SNSOcDMs7uP1a4yuvfXmHPIz7ADl9VgyPwW6gxNVXEdTdJqF8voov622KQyMNxNOdV4y7z2ftZqR1KGkqRQCTL9URh0w4ETf1",
  },
  {
    id: "#ORD-2023-8915",
    product: "Hario V60 Ceramic Coffee Dripper",
    date: "25 Okt 2023",
    status: "Dikirim",
    statusColor: "bg-[#d9dff5] text-[#5c6274]",
    total: "Rp 350.000",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtHVHGzLNucpoFaGa2IamIfP-6Cp9KwX9kzEgRiGAe7tRFZDWVGMvhIl3UjsdqLHDQ6EEZPn79hu6yYTCorv_HbjiBeph9OzWPX2AjoHRW1t0FciIx6K8kN5bA7FYKeu7Hcs3i4CWNs05zy5PQ1z3iVjsEsvSmSvP2WuH_ODUStEr7CTiXCazgmeLkTaPTr5EU0UV2WoAkQfsGR5TkQWbusNB6Cy7gXNQw02hzdT19a6I_VJHr0HPX",
  },
  {
    id: "#ORD-2023-9002",
    product: "Common Projects Achilles Low",
    date: "Kemarin",
    status: "Belum Bayar",
    statusColor: "bg-[#ffdad6] text-[#93000a]",
    total: "Rp 5.200.000",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHuRmEjK7WgOa1DeuadiVT_rj4XJ0RrxtkDuDev6wwMzQ3mH75WSRlOwu4WolZqCjDtcpTYR1o2HAhGeB6cUBrZLVbpWKN6TEEQXsxlbANUIWqLCBUtbkgSC3fWS1P3_a1jU343YkYpa4GI7eX1uQ8yibfqrypmXjbdPRuJdRN8d6dMgWvaBqWDBzJcN5fN_FEfMGysyu7Rg0ZMGQkT092mT2bgO3P2HPfp3T-5IN4leMf6l5Zt4Pj",
  },
];

const products = [
  {
    category: "Home & Living",
    name: "Modern Sphere Brass Lamp",
    price: "Rp 1.250.000",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4XMVs6FjVUvJ5jvHnTqDGSrw5PA18WB7orqn6VJtm66Em0EXqmqtDF_d12UIpR4pjAJfWgvD3jGBHJN2xSF24llb6AFMvKgkJxpWovb1Z5Imx_m7VbuKsY9nojpBdEG3CZmIsd6WwcZxyNjqHVUT2bUOkhgEQ1rG9MElaVV-BWiFwYqC985Mo4h37gotlVelviGOMsIu6rwhtaE3yuGzDjzrghy7eLaIfmXMlHcljFgA_uRtzJw_8",
  },
  {
    category: "Dining",
    name: "Earthy Ceramic Bowl Set",
    price: "Rp 450.000",
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa0uUTrUgkresdYBebBOwSqDOGJOxMpDXYJOpuzMHLPxoYqY_v1rXVJIkvC1P3FGEdgOobj977KafJGBF4Sf5qlgz5MpJE0i8iSXHwWRnEQ5iPpcvzfibwruMYN7KqdQVSFC_UzAjjgO_sC-phLecueA0fumUaBhfkwofyqc5nqs_10grxUpjO_s_g7kdGsfJhiWzp0UodtHoeRx0N1xzrY-5zvuMlJg3XBEd3MKxw0jZXPqLf-d8_",
  },
  {
    category: "Tech Accessories",
    name: "Ergo-Pro Wireless Mouse",
    price: "Rp 890.000",
    rating: "5.0",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtW6gF-ejrz13R8Ab0rWKCiJENtk8p8c00O8hC238to3vGzVOgLRQ5xp5RUd2_aTXQCxTcuGWXtBldiADtmY7HpN3vU6NE6UTzo7Dmim4N-oIM3ugYelxc4SZI2FntvxUUqfhc-pvbvPP9SSjHQI2eSUFIpw8dfbTo11eMLUVzEVt1hWxlqaj37H7lHdfOsBm76PEo4kqe_Uw9bVFolD1Uy2gtQ1BWzWb15X4jlYH2rEJpBMVz2S-m",
  },
  {
    category: "Apparel",
    name: "Heavy Cotton Forest Hoodie",
    price: "Rp 750.000",
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi5ab-hCG7IPyhquRuIcVls617FN5NpX91UcoyH2WjIHlV1zbtD3H8XX74FHNq_v-RQA2HZ_l-PwHZO4Y6ipX9CNTXgPlOrIpdjqsBblnENlVK-Xr-rURmlLWzSdgMnBcihO45MYlaSbsums8nvha0oznFQF1up7VmsFNQoLiXB2Cya6P7yP7Y6SSUEjSM_ffdPc4zHCsCBmJrCsMc5IGXBTXMJw2OJFBcvMORmOFQLM6qzjHUVf1H",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      {/* Material Symbols font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>

      <DashboardSidebar />

      {/* Main — offset for sidebar on desktop, padding-bottom for mobile nav */}
      <main className="lg:ml-64 min-h-screen px-4 sm:px-6 lg:px-12 py-8 pb-24 lg:pb-10 max-w-[calc(1280px+256px)] mx-auto">

        {/* Header */}
        <header className="flex justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-[#003527] font-semibold tracking-tight" style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
              Halo, John Doe
            </h2>
            <p className="text-[#404944] mt-1 text-sm sm:text-base">
              Senang melihat Anda kembali. Berikut ringkasan aktivitas belanja Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#404944] hover:bg-[#f3f4f5] transition-colors" aria-label="Notifikasi">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#064e3b]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4UnVRxaJEaTChDRRwPPHJj98_V0x8PAl8zw3MPdiAwzUmsuU9i1xDW_HqPpj6Jcr4VziVKkIN7pZh4CtOkkmy4CnYPg-vhmuwNrxW0S7NSzgG8eREU_zTnuH39xAlY0AP-eSN-D7GbeDVKlzREjVSk4D_nMBagL5GVap3L_AUkEOXEmbpy08Tx6lqOfp2uMMlHv8gEb6yHU0uOm2MDwsdW0hCAKWKTNVQhJUhJy6fecoueeHcy03n"
                alt="John Doe avatar"
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between h-36 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer active:scale-[0.98] ${
                s.dark ? "bg-[#003527] text-white" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined p-1.5 rounded-lg text-xl ${s.dark ? "text-[#95d3ba] bg-[#064e3b]" : "text-[#003527] bg-[#b0f0d6]"}`}>
                  {s.icon}
                </span>
                {s.badge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold tracking-wide ${s.dark ? "text-white/70" : "text-[#404944]"}`}>
                  {s.label}
                </p>
                <h3 className={`font-semibold mt-0.5 ${s.dark ? "text-white" : "text-[#003527]"}`} style={{ fontSize: "clamp(18px, 3vw, 30px)", lineHeight: "1.2" }}>
                  {s.value}
                </h3>
              </div>
            </div>
          ))}
        </section>

        {/* Order Status */}
        <section className="bg-white p-5 sm:p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] mb-8">
          <h4 className="text-[#003527] text-xs font-bold uppercase tracking-widest mb-5">
            Status Pesanan
          </h4>
          <div className="flex justify-around items-center">
            {orderStatuses.map((s, idx) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 relative cursor-pointer group flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#edeeef] flex items-center justify-center group-hover:bg-[#b0f0d6] transition-colors">
                    <span className="material-symbols-outlined text-[#404944] text-xl sm:text-2xl">{s.icon}</span>
                  </div>
                  {s.count !== null && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 ${s.countColor} text-white text-[9px] sm:text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white`}>
                      {s.count}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-semibold text-[#404944] text-center max-w-[60px] leading-tight">{s.label}</span>
                </div>
                {idx < orderStatuses.length - 1 && (
                  <div className="flex-1 h-px bg-[#e1e3e4] mx-2 sm:mx-4 mb-5" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[#003527] font-semibold" style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
              Aktivitas Terakhir
            </h4>
            <Link href="#" className="text-sm font-semibold text-[#003527] hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f3f4f5] border-b border-[#e1e3e4]">
                  <tr>
                    {["ID Pesanan", "Produk", "Tanggal", "Status", "Total"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-xs font-semibold text-[#404944] tracking-wide ${i === 4 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e3e4]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-[#191c1d]">{order.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#e7e8e9] shrink-0 overflow-hidden">
                            <Image src={order.img} alt={order.product} width={40} height={40} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-[#191c1d] truncate max-w-[180px]">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#404944]">{order.date}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${order.statusColor}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-right text-[#191c1d]">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-[#e1e3e4]">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#e7e8e9] shrink-0 overflow-hidden">
                    <Image src={order.img} alt={order.product} width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#191c1d] truncate">{order.product}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${order.statusColor}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-[#707974] mt-0.5">{order.id} · {order.date}</p>
                    <p className="text-sm font-bold text-[#003527] mt-1">{order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        <section className="mb-10">
          <h4 className="text-[#003527] font-semibold mb-5" style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
            Rekomendasi Untuk Kamu
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((p) => (
              <div key={p.name} className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden group cursor-pointer hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all">
                <div className="aspect-square bg-[#e7e8e9] overflow-hidden relative">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button className="absolute top-2 right-2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-[#003527] shadow-sm hover:bg-white transition-colors" aria-label="Tambah ke wishlist">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                  </button>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-[#404944] uppercase tracking-wider mb-1">{p.category}</p>
                  <h5 className="text-sm font-semibold text-[#191c1d] truncate">{p.name}</h5>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm sm:text-base font-bold text-[#003527]">{p.price}</span>
                    <span className="text-[11px] text-[#404944] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                      {p.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
