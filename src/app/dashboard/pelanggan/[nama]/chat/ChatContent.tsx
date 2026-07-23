"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getChatSocket } from "@/lib/chatSocket";
import { getToken } from "@/lib/auth";
import Composer from "@/components/chat/Composer";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator, { isNewDay } from "@/components/chat/DateSeparator";
import ScrollToBottom from "@/components/chat/ScrollToBottom";
import {
  previewText,
  formatChatTime,
  type ChatMessage,
  type ChatProduct,
  type ChatUser,
  type SendPayload,
} from "@/components/chat/types";

// ── Transport pelanggan: lewat Next proxy routes (cookie HttpOnly) ────────────

async function apiUpload(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Gagal upload file");
  return data.urls[0];
}

async function apiSend(payload: SendPayload): Promise<ChatMessage> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Gagal mengirim pesan");
  return data;
}

/** Format "terakhir dilihat" yang ramah dibaca */
function lastSeenText(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [myId, setMyId] = useState<string | null>(null);
  const [admin, setAdmin] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [product, setProduct] = useState<ChatProduct | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminLastSeen, setAdminLastSeen] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adminIdRef = useRef<string | null>(null);

  // ── Load awal: user, admin, riwayat ────────────────────────────────────────
  const loadConversation = useCallback(async (adminId: string) => {
    const res = await fetch(`/api/chat/${adminId}`, { cache: "no-store" });
    if (res.ok) {
      setMessages(await res.json());
      fetch(`/api/chat/${adminId}`, { method: "PATCH" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, adminRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/chat/admin-id", { cache: "no-store" }),
        ]);
        if (!meRes.ok || !adminRes.ok) {
          throw new Error("Gagal memuat chat. Silakan login ulang.");
        }
        const me = await meRes.json();
        const adminData: ChatUser = await adminRes.json();
        if (cancelled) return;

        // Admin tidak chat lewat halaman pelanggan — arahkan ke dashboard admin
        const role = me.role ?? me.user?.role;
        if (role === "ADMIN") {
          router.replace("/dashboard-admin/chat");
          return;
        }

        setMyId(me.id ?? me.user?.id);
        setAdmin(adminData);
        adminIdRef.current = adminData.id;
        await loadConversation(adminData.id);
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
  }, [loadConversation, router]);

  // ── Product context dari ?productSlug (tombol Tanya Produk) ────────────────
  useEffect(() => {
    const slug = searchParams.get("productSlug");
    if (!slug) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    fetch(`${base}/products/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p) {
          setProduct({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            images: p.images ?? [],
          });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const removeProduct = useCallback(() => {
    setProduct(null);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // ── Socket realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getChatSocket(getToken() ?? undefined);

    const onNew = (msg: ChatMessage) => {
      const adminId = adminIdRef.current;
      if (!adminId) return;
      if (msg.senderId !== adminId && msg.receiverId !== adminId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
      setIsTyping(false);
      // Pesan masuk dari admin saat chat terbuka → langsung tandai dibaca
      if (msg.senderId === adminId) {
        fetch(`/api/chat/${adminId}`, { method: "PATCH" }).catch(() => {});
      }
    };

    const onDeleted = ({ id }: { id: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, isDeleted: true, message: "", imageUrl: null, videoUrl: null, productId: null, product: null }
            : m,
        ),
      );
    };

    const onTypingEvt = ({ senderId }: { senderId: string }) => {
      if (senderId !== adminIdRef.current) return;
      setIsTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 2500);
    };

    const onRead = ({ readerId }: { readerId: string }) => {
      if (readerId !== adminIdRef.current) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId !== readerId ? { ...m, isRead: true } : m)),
      );
    };

    const onPresence = ({
      userId,
      online,
      lastSeen,
    }: {
      userId: string;
      online: boolean;
      lastSeen?: string;
    }) => {
      if (userId !== adminIdRef.current) return;
      setAdminOnline(online);
      if (!online && lastSeen) setAdminLastSeen(lastSeen);
    };

    const onPresenceState = (
      state: Record<string, { online: boolean; lastSeen: string | null }>,
    ) => {
      const adminId = adminIdRef.current;
      if (!adminId || !state[adminId]) return;
      setAdminOnline(state[adminId].online);
      setAdminLastSeen(state[adminId].lastSeen);
    };

    const queryPresence = () => {
      if (adminIdRef.current) {
        socket.emit("presence:query", { userIds: [adminIdRef.current] });
      }
    };

    const onConnect = () => {
      // Reconnect → refetch agar pesan yang terlewat masuk + refresh presence
      if (adminIdRef.current) loadConversation(adminIdRef.current);
      queryPresence();
    };

    socket.on("message:new", onNew);
    socket.on("message:deleted", onDeleted);
    socket.on("typing", onTypingEvt);
    socket.on("messages:read", onRead);
    socket.on("presence:update", onPresence);
    socket.on("presence:state", onPresenceState);
    socket.on("connect", onConnect);

    // Query awal jika socket sudah tersambung sebelum efek ini jalan
    if (socket.connected) queryPresence();

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:deleted", onDeleted);
      socket.off("typing", onTypingEvt);
      socket.off("messages:read", onRead);
      socket.off("presence:update", onPresence);
      socket.off("presence:state", onPresenceState);
      socket.off("connect", onConnect);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      // Socket sengaja TIDAK di-disconnect: dipakai bersama provider notifikasi global.
    };
  }, [loadConversation]);

  // Query presence begitu admin diketahui (socket effect mungkin jalan lebih dulu)
  useEffect(() => {
    if (!admin?.id) return;
    const socket = getChatSocket(getToken() ?? undefined);
    if (socket.connected) {
      socket.emit("presence:query", { userIds: [admin.id] });
    }
  }, [admin?.id]);

  // Auto-scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSend = async (payload: SendPayload) => {
    const msg = await apiSend(payload);
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
    );
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/chat/message/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, isDeleted: true, message: "", imageUrl: null, videoUrl: null, productId: null, product: null }
            : m,
        ),
      );
    }
  };

  const handleTyping = () => {
    if (adminIdRef.current) {
      getChatSocket().emit("typing", { receiverId: adminIdRef.current });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-[#e1e3e4] bg-white">
        <div className="flex flex-col items-center gap-3 text-[#707974]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527]/20 border-t-[#003527]" />
          <p className="text-sm">Memuat chat...</p>
        </div>
      </div>
    );
  }

  if (loadError || !admin) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-[#e1e3e4] bg-white">
        <div className="text-center text-[#707974]">
          <span className="material-symbols-outlined mb-2 text-4xl">error</span>
          <p className="text-sm">{loadError ?? "Admin tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  const lastMsg = messages[messages.length - 1];

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-[#e1e3e4] shadow-sm bg-white">
      {/* Conversation list — satu percakapan dengan admin */}
      <div className="hidden md:flex w-72 border-r border-[#e1e3e4] flex-col flex-shrink-0 bg-white">
        <div className="p-4 border-b border-[#e1e3e4]">
          <h3 className="text-xs font-semibold text-[#707974] uppercase tracking-wider">
            Percakapan
          </h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          <div className="w-full text-left px-3 py-2 mx-1 rounded-xl flex gap-3 items-center bg-[#f3f4f5] border-l-4 border-[#003527]">
            <div className="w-11 h-11 rounded-full bg-[#064e3b] flex-shrink-0 relative overflow-hidden flex items-center justify-center">
              {admin.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="material-symbols-outlined text-[#80bea6]">headset_mic</span>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-sm text-[#191c1d] truncate">{admin.name}</h4>
                {lastMsg && (
                  <span className="text-[10px] text-[#707974] flex-shrink-0">
                    {formatChatTime(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              <p className="text-xs truncate mt-0.5 text-[#707974]">
                {lastMsg ? previewText(lastMsg) : "Mulai percakapan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#f8f9fa]">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#e1e3e4] flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#064e3b] flex items-center justify-center text-[#80bea6] overflow-hidden">
              {admin.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="material-symbols-outlined">headset_mic</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#191c1d]">{admin.name}</h3>
              {adminOnline ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online • Siap membantu
                </p>
              ) : (
                <p className="text-xs text-[#707974] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#c4c7c8] rounded-full" />
                  {adminLastSeen
                    ? `Terakhir dilihat ${lastSeenText(adminLastSeen)}`
                    : "Offline"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="relative flex-1 min-h-0">
          <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-6 space-y-1">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-16 text-[#707974] gap-3">
                <span className="material-symbols-outlined text-5xl opacity-30">forum</span>
                <p className="text-sm">Belum ada pesan. Mulai percakapan dengan admin!</p>
              </div>
            )}
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
            {isTyping && (
              <div className="flex items-end gap-2 max-w-[78%] pt-2">
                <div className="w-8 h-8 rounded-full bg-[#064e3b] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#80bea6] text-base">headset_mic</span>
                </div>
                <div className="bg-white border border-[#e1e3e4] rounded-[16px_16px_16px_4px] p-4 text-sm text-[#707974] italic shadow-sm">
                  {admin.name} sedang mengetik...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <ScrollToBottom containerRef={scrollRef} />
        </div>

        {/* Composer */}
        <Composer
          receiverId={admin.id}
          product={product}
          onRemoveProduct={removeProduct}
          onUpload={apiUpload}
          onSend={handleSend}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}

export default function ChatContent() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center rounded-xl border border-[#e1e3e4] bg-white">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527]/20 border-t-[#003527]" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
