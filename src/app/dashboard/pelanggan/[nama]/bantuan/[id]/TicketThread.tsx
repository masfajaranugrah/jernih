"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getChatSocket } from "@/lib/chatSocket";
import { getToken } from "@/lib/auth";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator, { isNewDay } from "@/components/chat/DateSeparator";
import ScrollToBottom from "@/components/chat/ScrollToBottom";
import TicketComposer from "@/components/tickets/TicketComposer";
import {
  CATEGORY_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  toChatMessage,
  type Ticket,
  type TicketMessage,
} from "@/components/tickets/types";

async function apiUpload(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Gagal upload file");
  return data.urls[0];
}

export default function TicketThread({ ticketId }: { ticketId: string }) {
  const router = useRouter();

  const [myId, setMyId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const markRead = useCallback(() => {
    fetch(`/api/tickets/${ticketId}/read`, { method: "PATCH" }).catch(() => {});
  }, [ticketId]);

  const loadTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Gagal memuat tiket");
    setTicket(data);
    setMessages(data.messages ?? []);
    markRead();
  }, [ticketId, markRead]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) throw new Error("Gagal memuat sesi. Silakan login ulang.");
        const me = await meRes.json();
        if (cancelled) return;
        setMyId(me.id ?? me.user?.id);
        await loadTicket();
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTicket]);

  // Socket realtime: pesan & perubahan status tiket ini
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
    const res = await fetch(`/api/tickets/${ticketId}/messages`, {
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center rounded-xl border border-[#e1e3e4] bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527]/20 border-t-[#003527]" />
      </div>
    );
  }

  if (loadError || !ticket) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center rounded-xl border border-[#e1e3e4] bg-white">
        <div className="text-center text-[#707974]">
          <span className="material-symbols-outlined mb-2 text-4xl">error</span>
          <p className="text-sm">{loadError ?? "Tiket tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col overflow-hidden rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] shadow-sm">
      {/* Header tiket */}
      <div className="flex items-center gap-3 border-b border-[#e1e3e4] bg-white px-5 py-3.5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#404944] hover:bg-gray-100"
          aria-label="Kembali"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#191c1d]">Tiket #{ticket.number}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[ticket.priority]}`}>
              {PRIORITY_LABEL[ticket.priority]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
            </span>
          </div>
          <p className="truncate text-xs text-[#707974]">
            {CATEGORY_LABEL[ticket.category]} • {ticket.subject}
          </p>
        </div>
      </div>

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
        onUpload={apiUpload}
        onSend={handleSend}
        disabled={ticket.status === "CLOSED"}
      />
    </div>
  );
}
