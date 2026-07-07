import DashboardSidebar from "../DashboardSidebar";

export const metadata = {
  title: "Riwayat Pembayaran - Jernih Creatife",
  description: "Lacak dan kelola riwayat transaksi Anda.",
};

const transactions = [
  {
    id: "#MH-92834",
    date: "Oct 24, 2023",
    method: "Bank Transfer (BCA)",
    methodIcon: "account_balance",
    amount: "Rp 2.450.000",
    success: true,
  },
  {
    id: "#MH-92811",
    date: "Oct 22, 2023",
    method: "E-wallet (GoPay)",
    methodIcon: "account_balance_wallet",
    amount: "Rp 890.000",
    success: false,
  },
  {
    id: "#MH-92750",
    date: "Oct 18, 2023",
    method: "Credit Card (Visa)",
    methodIcon: "credit_card",
    amount: "Rp 5.200.000",
    success: true,
  },
  {
    id: "#MH-92699",
    date: "Oct 12, 2023",
    method: "E-wallet (OVO)",
    methodIcon: "account_balance_wallet",
    amount: "Rp 125.000",
    success: true,
  },
  {
    id: "#MH-92650",
    date: "Oct 05, 2023",
    method: "Bank Transfer (Mandiri)",
    methodIcon: "account_balance",
    amount: "Rp 3.785.000",
    success: true,
  },
];

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
        tbody tr { transition: transform 0.2s ease-out, background 0.15s; }
        tbody tr:hover { transform: translateX(4px); }
      `}</style>

      <DashboardSidebar />

      {/* TopNavBar */}
      <nav className="bg-[#f8f9fa] w-full h-16 sticky top-0 shadow-sm z-40 lg:ml-0">
        <div className="flex justify-between items-center px-6 max-w-[1280px] mx-auto w-full h-full lg:pl-[280px]">
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#404944] text-lg">search</span>
              <input className="w-full bg-[#f3f4f5] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#064e3b] transition-all outline-none" placeholder="Search transactions..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="material-symbols-outlined text-[#003527]">notifications</button>
            <button className="material-symbols-outlined text-[#003527]">shopping_cart</button>
            <button className="material-symbols-outlined text-[#003527]">account_circle</button>
          </div>
        </div>
      </nav>

      <main className="lg:ml-64 min-h-screen p-6 md:p-12 pb-24 lg:pb-12">
        {/* Page header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[#003527] font-semibold tracking-tight" style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: "1.1" }}>
              Riwayat Pembayaran
            </h1>
            <p className="text-[#404944] text-base mt-1">Track and manage your transaction history and invoices.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#bfc9c3] px-5 py-2 rounded-lg text-sm font-semibold text-[#191c1d] flex items-center gap-2 hover:bg-[#e7e8e9] transition-all">
              <span className="material-symbols-outlined text-lg">filter_list</span> Filter
            </button>
            <button className="bg-[#003527] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#064e3b] transition-all shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-lg">download</span> Export CSV
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e1e3e4]">
            <span className="text-xs text-[#404944] font-medium">Total Spent</span>
            <h3 className="text-[#003527] font-semibold mt-1" style={{ fontSize: "30px", lineHeight: "1.2" }}>Rp 12.450.000</h3>
            <div className="mt-4 text-[#003527] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">trending_up</span> 12% vs last month
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e1e3e4]">
            <span className="text-xs text-[#404944] font-medium">Successful Payments</span>
            <h3 className="text-[#003527] font-semibold mt-1" style={{ fontSize: "30px", lineHeight: "1.2" }}>24</h3>
            <div className="mt-4 text-[#404944] text-xs">Total transactions completed</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e1e3e4]">
            <span className="text-xs text-[#404944] font-medium">Active Subscriptions</span>
            <h3 className="text-[#003527] font-semibold mt-1" style={{ fontSize: "30px", lineHeight: "1.2" }}>2</h3>
            <div className="mt-4 text-[#ba1a1a] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">warning</span> Action required on 1
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f4f5] border-b border-[#e1e3e4]">
                  {["Transaction ID", "Date", "Method", "Amount", "Status", ""].map((h, i) => (
                    <th key={i} className={`px-6 py-4 text-xs font-semibold text-[#404944] tracking-wide ${i === 5 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e3e4]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#edeeef]">
                    <td className="px-6 py-4 text-sm font-bold text-[#003527]">{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-[#191c1d]">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#edeeef] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#404944] text-lg">{tx.methodIcon}</span>
                        </div>
                        <span className="text-sm text-[#191c1d]">{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#191c1d]">{tx.amount}</td>
                    <td className="px-6 py-4">
                      {tx.success ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#b0f0d6] text-[#002117] text-xs font-semibold">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-semibold">
                          <span className="material-symbols-outlined text-sm">cancel</span> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.success ? (
                        <button className="text-[#003527] hover:bg-[#b0f0d6] px-3 py-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 ml-auto">
                          <span className="material-symbols-outlined text-base">download</span> Download Invoice
                        </button>
                      ) : (
                        <span className="text-[#404944] opacity-50 px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ml-auto cursor-not-allowed">
                          <span className="material-symbols-outlined text-base">block</span> Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-[#f3f4f5] px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-[#404944]">Showing 5 of 24 transactions</span>
            <div className="flex gap-1">
              <button className="p-2 rounded hover:bg-[#e7e8e9] transition-all">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {[1, 2, 3].map((p) => (
                <button key={p} className={`w-8 h-8 rounded text-sm font-semibold flex items-center justify-center transition-all ${p === 1 ? "bg-[#003527] text-white" : "hover:bg-[#e7e8e9] text-[#404944]"}`}>
                  {p}
                </button>
              ))}
              <button className="p-2 rounded hover:bg-[#e7e8e9] transition-all">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade banner */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-xl bg-[#003527] h-48 flex items-center px-10 md:px-16">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#064e3b] rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
            <div className="absolute right-16 bottom-0 w-40 h-40 bg-[#095d47] rounded-full translate-y-1/2 opacity-40" />
            <div className="relative z-10 max-w-lg">
              <h2 className="text-white font-semibold" style={{ fontSize: "30px", lineHeight: "1.2" }}>
                Upgrade to Jernih Creatife Gold
              </h2>
              <p className="text-[#80bea6] text-sm mt-2">
                Get unlimited transaction history, priority support, and 2% cashback on every bank transfer.
              </p>
              <button className="mt-5 bg-[#b0f0d6] text-[#002117] px-8 py-3 rounded-lg text-sm font-bold hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
