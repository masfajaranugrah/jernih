"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { getToken } from "@/lib/auth";
import { getChatSocket } from "@/lib/chatSocket";
import { useToast } from "../components/Toast";
import {
 CATEGORY_LABEL,
 PRIORITY_BADGE,
 PRIORITY_LABEL,
 STATUS_BADGE,
 STATUS_LABEL,
 type Ticket,
 type TicketStatus,
} from "@/components/tickets/types";

const STATUS_TABS: Array<{ key: TicketStatus | "ALL"; label: string }> = [
 { key: "ALL", label: "Semua" },
 { key: "OPEN", label: "Terbuka" },
 { key: "RESOLVED", label: "Selesai" },
 { key: "CLOSED", label: "Ditutup" },
];

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
 });
}

export default function TicketsPage() {
 const router = useRouter();
 const toast = useToast();
 const [tickets, setTickets] = useState<Ticket[]>([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState<TicketStatus | "ALL">("ALL");

 const loadTickets = useCallback(async () => {
  try {
   const data = await adminApi<Ticket[]>("tickets/admin");
   setTickets(Array.isArray(data) ? data : []);
  } catch {
   // biarkan list apa adanya
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  loadTickets();
 }, [loadTickets]);

 // Realtime: refresh saat ada tiket/pesan/status baru
 useEffect(() => {
  const socket = getChatSocket(getToken() ?? undefined);
  socket.on("ticket:new", (ticket: Ticket) => {
   loadTickets();
   const customerName = ticket.user?.name ?? "Pelanggan";
   toast.info(`Tiket #${ticket.number}`, `${customerName} — ${ticket.subject.length > 40 ? ticket.subject.slice(0, 40) + "…" : ticket.subject}`);
  });
  socket.on("ticket:message", () => loadTickets());
  socket.on("ticket:update", () => loadTickets());
  socket.on("connect", () => loadTickets());
  return () => {
   socket.off("ticket:new");
   socket.off("ticket:message");
   socket.off("ticket:update");
   socket.off("connect");
  };
 }, [loadTickets]);

 const statusOrder: Record<string, number> = { OPEN: 0, RESOLVED: 1, CLOSED: 2 };
 const filtered = (tab === "ALL" ? tickets : tickets.filter((t) => t.status === tab))
  .sort((a, b) => {
   // Prioritaskan OPEN, lalu RESOLVED, lalu CLOSED
   const orderA = statusOrder[a.status] ?? 99;
   const orderB = statusOrder[b.status] ?? 99;
   if (orderA !== orderB) return orderA - orderB;
   // Status sama → urut dari yang terbaru
   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
 const openCount = tickets.filter((t) => t.status === "OPEN").length;

 return (
  <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased flex">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
   `}</style>


   <main className="lg:ml-64 flex-1 p-6 lg:p-10">
    <div className="mb-6 flex items-center justify-between">
     <div>
      <h1 className="text-2xl font-semibold">
       Bantuan Tiket
       {openCount > 0 && (
        <span className="ml-2 align-middle inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#003527] px-1.5 text-xs font-bold text-white">
         {openCount}
        </span>
       )}
      </h1>
      <p className="mt-1 text-sm text-[#707974]">
       Kendala pelanggan, urut berdasarkan siapa yang lapor duluan.
      </p>
     </div>
    </div>

    {/* Tab filter status */}
    <div className="mb-4 flex gap-2">
     {STATUS_TABS.map((t) => (
      <button
       key={t.key}
       type="button"
       onClick={() => setTab(t.key)}
       className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        tab === t.key
         ? "bg-[#003527] text-white"
         : "bg-white text-[#404944] border border-[#e1e3e4] hover:border-[#003527]/40"
       }`}
      >
       {t.label}
      </button>
     ))}
    </div>

    <div className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-sm">
     <table className="w-full text-left text-sm">
      <thead>
       <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs uppercase tracking-wider text-[#707974]">
        <th className="px-5 py-3 font-semibold">No. Tiket</th>
        <th className="px-5 py-3 font-semibold">Pelanggan</th>
        <th className="px-5 py-3 font-semibold">Kendala</th>
        <th className="px-5 py-3 font-semibold">Kategori</th>
        <th className="px-5 py-3 font-semibold">Prioritas</th>
        <th className="px-5 py-3 font-semibold">Status</th>
        <th className="px-5 py-3 font-semibold">Tanggal</th>
        <th className="px-5 py-3" />
       </tr>
      </thead>
      <tbody className="divide-y divide-[#f0f1f2]">
       {loading && (
        <tr>
         <td colSpan={8} className="px-5 py-10 text-center text-[#707974]">
          Memuat tiket...
         </td>
        </tr>
       )}
       {!loading && filtered.length === 0 && (
        <tr>
         <td colSpan={8} className="px-5 py-10 text-center text-[#707974]">
          Belum ada tiket.
         </td>
        </tr>
       )}
       {filtered.map((t) => (
        <tr
         key={t.id}
         onClick={() => router.push(`/dashboard-admin/tickets/${t.id}`)}
         className="cursor-pointer transition hover:bg-[#f8f9fa]"
        >
         <td className="px-5 py-4 font-bold text-[#003527]">
          #{t.number}
          {(t.unreadCount ?? 0) > 0 && (
           <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#003527] px-1 text-[10px] font-bold text-white">
            {t.unreadCount}
           </span>
          )}
         </td>
         <td className="px-5 py-4">
          <p className="font-semibold">{t.user?.name ?? "-"}</p>
          <p className="text-xs text-[#707974]">{t.user?.email}</p>
         </td>
         <td className="max-w-[220px] truncate px-5 py-4 text-[#404944]">
          {t.subject}
         </td>
         <td className="px-5 py-4">
          <span className="rounded-full bg-[#f3f4f5] px-2.5 py-1 text-xs font-medium text-[#404944]">
           {CATEGORY_LABEL[t.category]}
          </span>
         </td>
         <td className="px-5 py-4">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_BADGE[t.priority]}`}>
           {PRIORITY_LABEL[t.priority]}
          </span>
         </td>
         <td className="px-5 py-4">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[t.status]}`}>
           {STATUS_LABEL[t.status]}
          </span>
         </td>
         <td className="whitespace-nowrap px-5 py-4 text-xs text-[#707974]">
          {formatDate(t.createdAt)}
         </td>
         <td className="px-5 py-4 text-right">
          <span className="material-symbols-outlined text-[#c4c7c8]">
           chevron_right
          </span>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </main>
  </div>
 );
}
