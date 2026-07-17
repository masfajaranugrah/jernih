"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardSidebar from "../DashboardSidebar";
import { getToken, handleSessionExpired } from "@/lib/auth";
import { getChatSocket } from "@/lib/chatSocket";
import Composer from "@/components/chat/Composer";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator, { isNewDay } from "@/components/chat/DateSeparator";
import ScrollToBottom from "@/components/chat/ScrollToBottom";
import {
  previewText,
  formatChatTime,
  type ChatMessage,
  type ChatUser,
  type InboxItem,
  type SendPayload,
} from "@/components/chat/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ── Transport admin: langsung ke backend dengan Bearer token ─────────────────

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getToken() ?? ""}` };
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (res.status === 401) {
    handleSessionExpired();
    throw new Error("Sesi berakhir");
  }
  return res;
}

async function adminUpload(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);
  const res = await fetch(`${API}/upload`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Gagal upload file");
  return data.urls[0];
}

/** Nama → inisial untuk avatar */
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return formatChatTime(iso);
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const [myId, setMyId] = useState<string | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [search, setSearch] = useState("");
  const [partner, setPartner] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingFrom, setTypingFrom] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerRef = useRef<ChatUser | null>(null);
  const myIdRef = useRef<string | null>(null);
  partnerRef.current = partner;

  // ── Load inbox + identitas admin ────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    try {
      const res = await apiFetch("/chat/inbox");
      if (res.ok) setInbox(await res.json());
    } catch {
      // sesi berakhir sudah ditangani
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [meRes] = await Promise.all([apiFetch("/auth/me"), loadInbox()]);
        if (meRes.ok) {
          const me = await meRes.json();
          setMyId(me.id);
          myIdRef.current = me.id;
        }
      } catch {
        // ditangani apiFetch
      } finally {
        setLoading(false);
      }
    })();
  }, [loadInbox]);

  // ── Buka percakapan ─────────────────────────────────────────────────────────
  const openConversation = useCallback(
    async (user: ChatUser) => {
      setPartner(user);
      setTypingFrom(null);
      const res = await apiFetch(`/chat/${user.id}`);
      if (res.ok) setMessages(await res.json());
      apiFetch(`/chat/${user.id}/read`, { method: "PATCH" }).catch(() => {});
      // Reset badge unread lokal
      setInbox((prev) =>
        prev.map((item) => {
          const pid =
            item.lastMessage.senderId === myIdRef.current
              ? item.lastMessage.receiverId
              : item.lastMessage.senderId;
          return pid === user.id ? { ...item, unreadCount: 0 } : item;
        }),
      );
    },
    [],
  );

  // ── Socket realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getChatSocket(getToken() ?? undefined);

    const onNew = (msg: ChatMessage) => {
      const current = partnerRef.current;
      const isCurrentConv =
        current && (msg.senderId === current.id || msg.receiverId === current.id);
      if (isCurrentConv) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
        setTypingFrom(null);
        if (msg.senderId === current!.id) {
          apiFetch(`/chat/${current!.id}/read`, { method: "PATCH" }).catch(() => {});
        }
      }
      loadInbox();
    };

    const onDeleted = ({ id }: { id: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, isDeleted: true, message: "", imageUrl: null, videoUrl: null, productId: null, product: null }
            : m,
        ),
      );
      loadInbox();
    };

    const onTypingEvt = ({ senderId }: { senderId: string }) => {
      if (senderId !== partnerRef.current?.id) return;
      setTypingFrom(senderId);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingFrom(null), 2500);
    };

    const onRead = ({ readerId }: { readerId: string }) => {
      if (readerId !== partnerRef.current?.id) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId !== readerId ? { ...m, isRead: true } : m)),
      );
    };

    const onConnect = () => {
      loadInbox();
      const current = partnerRef.current;
      if (current) {
        apiFetch(`/chat/${current.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data && setMessages(data))
          .catch(() => {});
      }
    };

    socket.on("message:new", onNew);
    socket.on("message:deleted", onDeleted);
    socket.on("typing", onTypingEvt);
    socket.on("messages:read", onRead);
    socket.on("connect", onConnect);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:deleted", onDeleted);
      socket.off("typing", onTypingEvt);
      socket.off("messages:read", onRead);
      socket.off("connect", onConnect);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      // Socket sengaja TIDAK di-disconnect: dipakai bersama provider notifikasi global.
    };
  }, [loadInbox]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingFrom]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSend = async (payload: SendPayload) => {
    const res = await apiFetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Gagal mengirim pesan");
    setMessages((prev) =>
      prev.some((m) => m.id === data.id) ? prev : [...prev, data],
    );
    loadInbox();
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/chat/message/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, isDeleted: true, message: "", imageUrl: null, videoUrl: null, productId: null, product: null }
            : m,
        ),
      );
      loadInbox();
    }
  };

  const handleTyping = () => {
    if (partnerRef.current) {
      getChatSocket(getToken() ?? undefined).emit("typing", {
        receiverId: partnerRef.current.id,
      });
    }
  };

  // ── Derived: daftar partner dari inbox ──────────────────────────────────────
  const partners = inbox
    .map((item) => {
      const msg = item.lastMessage;
      const other = msg.senderId === myId ? msg.receiver : msg.sender;
      return { user: other as ChatUser, lastMessage: msg, unreadCount: item.unreadCount };
    })
    .filter((p) => p.user)
    .filter(
      (p) =>
        !search || p.user.name.toLowerCase().includes(search.toLowerCase()),
    );

  const totalUnread = inbox.reduce((sum, i) => sum + i.unreadCount, 0);

  return (
    <div className="h-screen bg-[#f8f9fa] text-[#191c1d] antialiased flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e1e3e4; border-radius: 10px; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .dot-bounce { animation: bounce 1s infinite; }
      `}</style>

      <DashboardSidebar />

      {/* Main workspace */}
      <main className="lg:ml-64 flex-1 flex h-full overflow-hidden">
        {/* Left panel: chat list */}
        <aside className="w-72 xl:w-80 bg-white border-r border-[#e1e3e4] flex-col flex-shrink-0 hidden md:flex">
          <div className="p-5 border-b border-[#e1e3e4] bg-[#f8f9fa]">
            <h2 className="text-[#191c1d] font-semibold text-2xl mb-3">
              Chat Pelanggan
              {totalUnread > 0 && (
                <span className="ml-2 align-middle inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-[#003527] text-white text-xs font-bold">
                  {totalUnread}
                </span>
              )}
            </h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#404944] text-lg">search</span>
              <input
                className="w-full pl-9 pr-3 py-2.5 bg-[#e1e3e4] border-none rounded-lg text-sm focus:ring-1 focus:ring-[#003527] focus:bg-white transition-colors outline-none"
                placeholder="Cari pelanggan..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {loading && (
              <p className="p-3 text-sm text-[#404944]">Memuat percakapan...</p>
            )}
            {!loading && partners.length === 0 && (
              <p className="p-3 text-sm text-[#404944]">Belum ada percakapan.</p>
            )}
            {partners.map(({ user, lastMessage, unreadCount }) => (
              <button
                key={user.id}
                onClick={() => openConversation(user)}
                className={`w-full text-left p-3 rounded-lg relative transition-all ${
                  partner?.id === user.id
                    ? "bg-[#f3f4f5] border border-[#003527]/20"
                    : "hover:bg-[#f3f4f5] border border-transparent"
                }`}
              >
                {partner?.id === user.id && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#003527] rounded-r-full" />
                )}
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center flex-shrink-0 text-[#5c6274] text-xs font-bold overflow-hidden">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(user.name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#191c1d] truncate">{user.name}</span>
                      <span className="text-xs text-[#404944] flex-shrink-0">
                        {relativeTime(lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? "text-[#003527] font-semibold" : "text-[#404944]"}`}>
                      {previewText(lastMessage)}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-[#003527] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center panel: chat thread */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] relative">
          {!partner ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#404944] gap-3">
              <span className="material-symbols-outlined text-6xl opacity-30">forum</span>
              <p className="text-sm">Pilih percakapan untuk mulai membalas</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <header className="h-16 px-6 border-b border-[#e1e3e4] bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5c6274] text-sm font-bold overflow-hidden">
                    {partner.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(partner.name)
                    )}
                  </div>
                  <div>
                    <h2 className="text-[#191c1d] font-semibold text-xl leading-none">{partner.name}</h2>
                    <span className="text-xs text-[#404944]">Pelanggan</span>
                  </div>
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="relative flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-1">
                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {idx === 0 || isNewDay(messages[idx - 1].createdAt, msg.createdAt) ? (
                      <DateSeparator date={msg.createdAt} />
                    ) : null}
                    <MessageBubble
                      msg={msg}
                      own={msg.senderId === myId}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
                {typingFrom && (
                  <div className="flex items-end gap-3 max-w-[80%] pt-2">
                    <div className="bg-white border border-[#e1e3e4] rounded-2xl rounded-bl-none p-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4 px-1">
                        <div className="w-1.5 h-1.5 bg-[#404944] rounded-full dot-bounce" style={{ animationDelay: "0s" }} />
                        <div className="w-1.5 h-1.5 bg-[#404944] rounded-full dot-bounce" style={{ animationDelay: "0.15s" }} />
                        <div className="w-1.5 h-1.5 bg-[#404944] rounded-full dot-bounce" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
                <ScrollToBottom containerRef={scrollRef} />
              </div>

              {/* Composer */}
              <Composer
                receiverId={partner.id}
                onUpload={adminUpload}
                onSend={handleSend}
                onTyping={handleTyping}
                enableProductPicker
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
