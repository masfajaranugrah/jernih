import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Overview - Dashboard Pelanggan | Jernih Creatife",
  description: "Ringkasan aktivitas belanja Anda di Jernih Creatife.",
};

const recentOrders = [
  {
    id: "#ORD-8921",
    name: "Emerald Cut Solitaire",
    info: "Order #ORD-8921 • 2 items",
    status: "In Transit",
    statusColor: "bg-[#d9dff5] text-[#5c6274]",
    price: "$1,240.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6kx_ivNLdEmSEAnOlzwLd0tUec-egn4MjfWezWmUPNZy9gVki0aWjgYOf69PoCS24H16INsiu-tUGEVsVtJnFFUEOSwBDTKN2iODO3K6588Z51Luia59vFnNsIfcHvdE3UderQDh-DRQXuUMq2LEneupMLXDbAPzcbOrhlSehfmQ1p6ayZN--27w5FCjIxpkq5PmJflcJs1PYv_xuQz6adFG-a-NQoXqltT3hOuVDQ_u__doS1tu2",
  },
  {
    id: "#ORD-8845",
    name: "Artisan Ceramic Vase",
    info: "Order #ORD-8845 • 1 item",
    status: "Delivered",
    statusColor: "bg-[#edeeef] text-[#404944]",
    price: "$185.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgXcCV7NlB182pfGQEVq3zrJyOhsKQv9p59UNiKusXE54O2uC1E4btkx1eDqj9reODTHlvwdNjw6Wk76Oj3LEZiWTF2CF97eRvZaO3hjJG0Te4XXN0JavbJnHpmVkFpNM5CDVARV2CwB6IhFMVKqd5AZ0rLRw6ZhYfc8Cbsyv0I2HZYdkbnDyTSXn1QTIrEPIp0FFxIXfVdQy3xYoEBj429zJFrmIahOb9vuoNmxnVKwzBX1zF3xRR",
  },
];

export default function DashboardPelangganPage() {
  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex justify-between items-center mb-8">
        <h1 className="text-[#003527] font-bold text-2xl">Overview</h1>
        <button className="p-2 text-[#003527] hover:bg-[#f3f4f5] rounded-full transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Desktop welcome */}
      <div className="hidden md:block mb-12">
        <h1 className="text-[#003527] font-bold tracking-tight" style={{ fontSize: "48px", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
          Welcome back, Jernih
        </h1>
        <p className="text-[#404944] mt-2 text-lg">Here is a summary of your recent activity.</p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Hero promo card — 8 cols */}
        <div className="md:col-span-8 rounded-xl bg-white shadow-sm border border-[#e1e3e4] overflow-hidden relative min-h-[300px] flex items-end p-6 lg:p-8 group">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJPciYBFzzZimyBi2NuwaJWc_S0zUemXm5qwCgkJxOMQ3ehxETeFTJAKFLk-fSrMnE0nzOWgB_Ey-S6AI-OfWiA-uAJUNtUb-_9OHsIORkxMtjRBIlracRxFtM1Gpm5xPRng4PhRK2KSOJrooa62Q1hvUOb1c86OEIvZRjbAZBku99Lsfu-7p94z88V0ZPfDYlNmgpE358FT2JwxHFmq_QuQEDC1P7glUo2WX9Q7LLdhHVlyRKCSA5"
              alt="The Emerald Estate Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="relative z-10 text-white max-w-lg">
            <span className="inline-block px-3 py-1 bg-[#064e3b] text-[#80bea6] text-xs font-bold uppercase rounded-full mb-3 backdrop-blur-md">
              New Collection
            </span>
            <h2 className="font-semibold text-2xl mb-2">The Emerald Estate</h2>
            <p className="text-white/90 text-base mb-5 line-clamp-2">
              Discover our latest curation of sustainable, premium furniture designed for the modern sanctuary.
            </p>
            <button className="bg-[#003527] hover:bg-[#064e3b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1">
              Explore Now
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Stats column — 4 cols */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Account status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#e1e3e4] flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#404944] uppercase tracking-wider">Account Status</h3>
              <span className="material-symbols-outlined text-[#064e3b] icon-fill">verified</span>
            </div>
            <span className="text-[#003527] font-bold text-2xl mb-3">Premium Tier</span>
            <div className="w-full bg-[#e7e8e9] rounded-full h-2 mb-2">
              <div className="bg-[#003527] h-2 rounded-full" style={{ width: "75%" }} />
            </div>
            <p className="text-xs text-[#575e70]">750 pts to Platinum</p>
          </div>

          {/* Active orders */}
          <Link
            href="orders"
            className="bg-[#003527] text-white rounded-xl shadow-sm p-6 flex items-center justify-between hover:bg-[#064e3b] transition-colors cursor-pointer"
          >
            <div>
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Active Orders</h3>
              <span className="text-2xl font-bold">2 Deliveries</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
          </Link>
        </div>

        {/* Recent orders — 8 cols */}
        <div className="md:col-span-8 bg-white rounded-xl shadow-sm border border-[#e1e3e4] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#003527] font-semibold text-2xl">Recent Orders</h3>
            <Link
              href="orders"
              className="text-sm font-semibold text-[#2b6954] hover:text-[#003527] transition-colors flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-base">arrow_right_alt</span>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentOrders.map((order, i) => (
              <div key={order.id}>
                {i > 0 && <hr className="border-[#e1e3e4]/50 mb-3" />}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f3f4f5] transition-colors border border-transparent hover:border-[#bfc9c3]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-[#e7e8e9] overflow-hidden shrink-0">
                      <Image src={order.img} alt={order.name} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#191c1d] mb-0.5">{order.name}</h4>
                      <p className="text-xs text-[#575e70]">{order.info}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-1 ${order.statusColor}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-[#003527]">{order.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary address — 4 cols */}
        <div className="md:col-span-4 bg-white rounded-xl shadow-sm border border-[#e1e3e4] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[#003527] font-semibold text-2xl">Primary Address</h3>
            <Link href="addresses">
              <button className="text-[#575e70] hover:text-[#003527] transition-colors p-1">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </Link>
          </div>
          <div className="flex gap-3 items-start mb-5">
            <span className="material-symbols-outlined text-[#2b6954] mt-0.5 shrink-0">location_on</span>
            <div>
              <p className="text-sm font-semibold text-[#191c1d] mb-1">Jernih Creative Studio</p>
              <p className="text-sm text-[#575e70] leading-relaxed">
                123 Design Boulevard, Suite 400<br />
                Creative District, NY 10001<br />
                United States
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <div className="w-full h-32 rounded-lg bg-[#e7e8e9] overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_Y9lcnSYWz7z7lYkAwSyaFzOPR0sLqBXa7Utfc-RIKVWGKtso0i7bDoUhUTd5JbE2ev76ok5OyjpG1C1EWVmLHqrZqDwxQKq4BO2VYAeOw8utXY7GlwoAXiN7N61mZIYSgQ3qAuIt9tKoMP3uDgnEQL5w5ZIU5bv5z7MWZJkZESyOUX4fBeRiqM7TV7c1TF-KfjEmMM5wh6L6HkCJfseMS01vY56T1RUNtxOWwdNhsnCdz9o-ZB2E"
                alt="Map Location"
                fill
                className="object-cover opacity-80"
              />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
