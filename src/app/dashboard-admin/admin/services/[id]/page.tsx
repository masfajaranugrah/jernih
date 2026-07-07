import { notFound } from "next/navigation";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import EditServiceForm from "../EditServiceForm";
import { fetchServiceById } from "@/lib/service-actions";

export const metadata = { title: "Edit Jasa - Admin Jernih Creatife" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await fetchServiceById(id);
  if (!service) notFound();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <div className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-3 border-b border-[#e1e3e4] bg-white/90 px-6 shadow-sm backdrop-blur">
          <span className="material-symbols-outlined text-[#003527]">edit</span>
          <h1 className="text-[#003527] font-bold text-lg">Edit Jasa</h1>
        </header>

        <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
          <EditServiceForm service={service} />
        </main>
      </div>
    </div>
  );
}
