import Link from "next/link";
import VouchersContent from "./VouchersContent";

export const metadata = {
  title: "Vouchers - Dashboard Pelanggan",
  description: "Kelola dan gunakan voucher diskon Anda.",
};

export default async function VouchersPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const { nama } = await params;
  return (
    <>
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-4">
          <div className="md:hidden">
            <Link
              href={`/dashboard/pelanggan/${nama}/profile`}
              aria-label="Kembali"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#191c1d] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e1e3e4] transition-colors hover:bg-[#f3f4f5] active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          </div>
          <h1 className="text-[#191c1d] font-semibold tracking-tight text-2xl md:text-[36px]"
            style={{ lineHeight: "1.2", letterSpacing: "-0.02em" }}>
            Vouchers
          </h1>
        </div>
      </div>
      <VouchersContent />
    </>
  );
}
