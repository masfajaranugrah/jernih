import { redirect } from "next/navigation";

// Halaman Overview dihapus — root dashboard pelanggan langsung diarahkan ke Orders.
export default async function DashboardPelangganPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const { nama } = await params;
  redirect(`/dashboard/pelanggan/${nama}/orders`);
}
