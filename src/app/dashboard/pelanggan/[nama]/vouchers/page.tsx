import VouchersContent from "./VouchersContent";

export const metadata = {
  title: "Vouchers - Dashboard Pelanggan",
  description: "Kelola dan gunakan voucher diskon Anda.",
};

export default function VouchersPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[#191c1d] font-semibold tracking-tight mb-1"
          style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}>
          Vouchers
        </h1>
        <p className="text-[#707974] text-base">Gunakan voucher untuk hemat lebih banyak.</p>
      </div>
      <VouchersContent />
    </>
  );
}
