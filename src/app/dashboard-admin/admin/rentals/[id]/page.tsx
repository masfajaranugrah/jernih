import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";
import EditRentalForm from "../EditRentalForm";
import { fetchRentalItemById } from "@/lib/rental-actions";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Item Sewa - Admin Jernih Creatife" };

export default async function EditRentalPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await fetchRentalItemById(id);

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>
      <DashboardSidebar />
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6">
          <EditRentalForm item={item} />
        </main>
      </div>
    </div>
  );
}
