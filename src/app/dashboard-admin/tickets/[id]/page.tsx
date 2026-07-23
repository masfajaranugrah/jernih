"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getChatSocket } from "@/lib/chatSocket";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator, { isNewDay } from "@/components/chat/DateSeparator";
import ScrollToBottom from "@/components/chat/ScrollToBottom";
import TicketComposer from "@/components/tickets/TicketComposer";
import {
 CATEGORY_LABEL,
 PRIORITY_LABEL,
 STATUS_LABEL,
 toChatMessage,
 type Ticket,
 type TicketMessage,
 type TicketPriority,
 type TicketStatus,
} from "@/components/tickets/types";

const BFF = "/api/admin/proxy";

async function apiFetch(path: string, init?: RequestInit) {
 const url = `${BFF}/${path.replace(/^\//, "")}`;
 const res = await fetch(url, {
  ...init,
  headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  cache: "no-store",
 });
 if (res.status === 401) {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/dashboard-admin/admin/login";
  throw new Error("Sesi berakhir");
 }
 return res;
}

async function adminUpload(file: File): Promise<string> {
 const form = new FormData();
 form.append("files", file);
 const res = await fetch("/api/upload", { method: "POST", body: form });
 const data = await res.json();
 if (!res.ok) throw new Error(data.message ?? "Gagal upload file");
 return data.urls[0];
}

export default function AdminTicketDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id: ticketId } = use(params);
 const router = useRouter();

 const [myId, setMyId] = useState<string | null>(null);
 const [ticket, setTicket] = useState<Ticket | null>(null);
 const [messages, setMessages] = useState<TicketMessage[]>([]);
 const [loading, setLoading] = useState(true);
 const [updating, setUpdating] = useState(false);

 const scrollRef = useRef<HTMLDivElement>(null);
 const bottomRef = useRef<HTMLDivElement>(null);

 const markRead = useCallback(() => {
  apiFetch(`/tickets/${ticketId}/read`, { method: "PATCH" }).catch(() => {});
 }, [ticketId]);

 const loadTicket = useCallback(async () => {
  const res = await apiFetch(`/tickets/${ticketId}`);
  if (res.ok) {
   const data = await res.json();
   setTicket(data);
   setMessages(data.messages ?? []);
   markRead();
  }
 }, [ticketId, markRead]);

 useEffect(() => {
  (async () => {
   try {
    const meRes = await apiFetch("/auth/me");
    if (meRes.ok) {
     const me = await meRes.json();
     setMyId(me.id);
    }
    await loadTicket();
   } catch {
    // ditangani apiFetch
   } finally {
    setLoading(false);
   }
  })();
 }, [loadTicket]);

 // Socket realtime
 useEffect(() => {
  const socket = getChatSocket(getToken() ?? undefined);

  const onMessage = (msg: TicketMessage) => {
   if (msg.ticketId !== ticketId) return;
   setMessages((prev) =>
    prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
   );
   markRead();
  };

  const onUpdate = (t: Ticket) => {
   if (t.id !== ticketId) return;
   setTicket((prev) => (prev ? { ...prev, ...t } : t));
  };

  const onConnect = () => {
   loadTicket().catch(() => {});
  };

  socket.on("ticket:message", onMessage);
  socket.on("ticket:update", onUpdate);
  socket.on("connect", onConnect);
  return () => {
   socket.off("ticket:message", onMessage);
   socket.off("ticket:update", onUpdate);
   socket.off("connect", onConnect);
  };
 }, [ticketId, markRead, loadTicket]);

 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = async (payload: { message: string; imageUrl?: string }) => {
  const res = await apiFetch(`/tickets/${ticketId}/messages`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Gagal mengirim pesan");
  setMessages((prev) =>
   prev.some((m) => m.id === data.id) ? prev : [...prev, data],
  );
 };

 const patchTicket = async (patch: { status?: TicketStatus; priority?: TicketPriority }) => {
  if (updating) return;
  setUpdating(true);
  try {
   const res = await apiFetch(`/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
   });
   if (res.ok) setTicket(await res.json());
  } finally {
   setUpdating(false);
  }
 };

 return (
  <div className="flex-1 bg-[#f8f9fa] text-[#191c1d] antialiased flex flex-col min-h-0">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
   `}</style>


   <main className="lg:ml-64 flex-1 flex flex-col min-h-0 overflow-hidden">
    {loading || !ticket ? (
     <div className="flex flex-1 items-center justify-center">
      {loading ? (
       <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527]/20 border-t-[#003527]" />
      ) : (
       <p className="text-sm text-[#707974]">Tiket tidak ditemukan</p>
      )}
     </div>
    ) : (
     <>
      {/* Header tiket */}
      <header className="flex-shrink-0 flex flex-wrap items-center gap-3 border-b border-[#e1e3e4] bg-white px-6 py-4">
       <button
        type="button"
        onClick={() => router.push("/dashboard-admin/tickets")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#404944] hover:bg-gray-100"
        aria-label="Kembali"
       >
        <span className="material-symbols-outlined">arrow_back</span>
       </button>
       <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
         <h1 className="text-lg font-bold">Tiket #{ticket.number}</h1>
         <span className="rounded-full bg-[#f3f4f5] px-2.5 py-0.5 text-xs font-medium text-[#404944]">
          {CATEGORY_LABEL[ticket.category]}
         </span>
        </div>
        <p className="truncate text-xs text-[#707974]">
         {ticket.user?.name} • {ticket.user?.email}
        </p>
       </div>

       {/* Kontrol status & prioritas */}
       <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#404944]">
         Prioritas
         <select
          value={ticket.priority}
          disabled={updating}
          onChange={(e) => patchTicket({ priority: e.target.value as TicketPriority })}
          className="rounded-lg border border-[#e1e3e4] bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-[#003527]"
         >
          {(Object.keys(PRIORITY_LABEL) as TicketPriority[]).map((p) => (
           <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
           </option>
          ))}
         </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#404944]">
         Status
         <select
          value={ticket.status}
          disabled={updating}
          onChange={(e) => patchTicket({ status: e.target.value as TicketStatus })}
          className="rounded-lg border border-[#e1e3e4] bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-[#003527]"
         >
          {(Object.keys(STATUS_LABEL) as TicketStatus[]).map((s) => (
           <option key={s} value={s}>
            {STATUS_LABEL[s]}
           </option>
          ))}
         </select>
        </label>
       </div>
      </header>

      {/* Pesan */}
      <div ref={scrollRef} className="relative flex-1 space-y-1 overflow-y-auto p-6">
       {messages.map((msg, idx) => (
        <div key={msg.id}>
         {idx === 0 || isNewDay(messages[idx - 1].createdAt, msg.createdAt) ? (
          <DateSeparator date={msg.createdAt} />
         ) : null}
         <MessageBubble msg={toChatMessage(msg)} own={msg.senderId === myId} />
        </div>
       ))}
       <div ref={bottomRef} />
       <ScrollToBottom containerRef={scrollRef} />
      </div>

      {/* Composer */}
      <TicketComposer
       onUpload={adminUpload}
       onSend={handleSend}
       disabled={ticket.status === "CLOSED"}
       disabledText="Tiket ditutup — ubah status untuk membalas"
      />
     </>
    )}
   </main>
  </div>
 );
}
