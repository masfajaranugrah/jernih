"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { handleSessionExpired } from "@/lib/auth";
import { getChatSocket } from "@/lib/chatSocket";
import { useToast } from "../components/Toast";
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

async function apiFetch(path: string, init?: RequestInit) {
 const res = await fetch(`/api${path}`, {
  ...init,
  headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
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
 const res = await fetch("/api/upload", { method: "POST", body: form });
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
 const [showOrderModal, setShowOrderModal] = useState(false);
 const [orderProduct, setOrderProduct] = useState("");
 const [orderPrice, setOrderPrice] = useState("");
 const [orderQty, setOrderQty] = useState(1);
 const [orderTipe, setOrderTipe] = useState("");
 const [orderLoading, setOrderLoading] = useState(false);
 const [productSearch, setProductSearch] = useState("");
 const [productResults, setProductResults] = useState<Array<{ id: string; name: string; price: string | number; images?: string[] }>>([]);
 const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; price: string | number } | null>(null);
 const [showProductPicker, setShowProductPicker] = useState(false);
 const toast = useToast();

 const scrollRef = useRef<HTMLDivElement>(null);
 const bottomRef = useRef<HTMLDivElement>(null);
 const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const partnerRef = useRef<ChatUser | null>(null);
 const myIdRef = useRef<string | null>(null);
 partnerRef.current = partner;

 // ── Load inbox + identitas admin ────────────────────────────────────────────
 const loadInbox = useCallback(async () => {
  try {
   const res = await apiFetch("/chat");
   if (res.ok) setInbox(await res.json());
  } catch {
   // sesi berakhir sudah ditangani
  }
 }, []);

 // Debounce loadInbox — hindari banjir API saat banyak event bersamaan
 const debouncedLoadInbox = useRef<ReturnType<typeof setTimeout> | null>(null);
 const queueLoadInbox = useCallback(() => {
  if (debouncedLoadInbox.current) clearTimeout(debouncedLoadInbox.current);
  debouncedLoadInbox.current = setTimeout(() => loadInbox(), 500);
 }, [loadInbox]);

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
   apiFetch(`/chat/${user.id}`, { method: "PATCH" }).catch(() => {});
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
  const socket = getChatSocket();

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
     apiFetch(`/chat/${current!.id}`, { method: "PATCH" }).catch(() => {});
    }
   } else {
    // Notif toast untuk pesan baru dari pelanggan yang berbeda
    const senderName = msg.sender?.name ?? "Pelanggan";
    const preview = msg.message ? (msg.message.length > 50 ? msg.message.slice(0, 50) + "…" : msg.message) : (msg.imageUrl ? "📷 Gambar" : msg.productId ? "📦 Produk" : "Pesan baru");
    toast.info(senderName, preview);
   }
   queueLoadInbox();
  };

  const onDeleted = ({ id }: { id: string }) => {
   setMessages((prev) =>
    prev.map((m) =>
     m.id === id
      ? { ...m, isDeleted: true, message: "", imageUrl: null, videoUrl: null, productId: null, product: null }
      : m,
    ),
   );
   queueLoadInbox();
  };

  const onTypingEvt = ({ senderId }: { senderId: string }) => {
   if (senderId !== partnerRef.current?.id) return;
   setTypingFrom(senderId);
   if (typingTimer.current) clearTimeout(typingTimer.current);
   typingTimer.current = setTimeout(() => setTypingFrom(null), 4000);
  };

  const onRead = ({ readerId }: { readerId: string }) => {
   if (readerId !== partnerRef.current?.id) return;
   setMessages((prev) =>
    prev.map((m) => (m.senderId !== readerId ? { ...m, isRead: true } : m)),
   );
  };

  const onConnect = () => {
   queueLoadInbox();
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
  queueLoadInbox();
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
   queueLoadInbox();
  }
 };

 // Throttle typing — max 1 emit per 2 detik
 const typingThrottle = useRef<number>(0);
 const handleTyping = () => {
  if (!partnerRef.current) return;
  const now = Date.now();
  if (now - typingThrottle.current < 2000) return;
  typingThrottle.current = now;
  getChatSocket().emit("typing", {
   receiverId: partnerRef.current.id,
  });
 };

 // ── Cari Produk ────────────────────────────────────────────────────────────
 const searchProducts = useCallback(async (q: string) => {
  if (!q.trim()) { setProductResults([]); return; }
  try {
   const res = await apiFetch(`/products/search?q=${encodeURIComponent(q)}`);
   if (res.ok) setProductResults(await res.json());
  } catch { /* ignore */ }
 }, []);

 useEffect(() => {
  const t = setTimeout(() => searchProducts(productSearch), 300);
  return () => clearTimeout(t);
 }, [productSearch, searchProducts]);

 // ── Buat Pesanan dari Chat ────────────────────────────────────────────────
 const handleCreateOrder = async () => {
  const productName = selectedProduct?.name || orderProduct.trim();
  const productPrice = selectedProduct ? Number(selectedProduct.price) : Number(orderPrice.replace(/[^0-9]/g, ""));
  const productId = selectedProduct?.id || `chat-${Date.now()}`;
  if (!partnerRef.current || !productName || !productPrice) {
   toast.error("Pilih produk atau lengkapi nama dan harga");
   return;
  }
  setOrderLoading(true);
  try {
   const res = await apiFetch("/orders/create-from-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     productId,
     name: productName,
     price: productPrice,
     quantity: orderQty,
     tipe: orderTipe.trim() || undefined,
    }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.message || "Gagal buat pesanan");
   toast.success(`Pesanan #${data.orderNumber} berhasil dibuat!`);
   setShowOrderModal(false);
   setOrderProduct("");
   setOrderPrice("");
   setOrderQty(1);
   setOrderTipe("");
   setSelectedProduct(null);
   setProductSearch("");
   setProductResults([]);
   // Kirim notifikasi system message ke chat
   getChatSocket().emit("message:new", {
    senderId: myIdRef.current,
    receiverId: partnerRef.current.id,
    message: `✅ Pesanan #${data.orderNumber} sudah dibuat untuk ${orderProduct.trim()}!\n\nSilahkan pelanggan melakukan pembayaran ke:\nBank BCA: 1234567890 a.n. Jernih Creatife\n\n*Mohon jangan hapus nomor pesanan ini.*`,
    isSystem: true,
   });
   // Reload inbox + messages
   queueLoadInbox();
  } catch (err) {
   toast.error("Gagal", err instanceof Error ? err.message : "Coba lagi");
  } finally {
   setOrderLoading(false);
  }
 };

 // ── Derived: daftar partner dari inbox (deduplikasi by user.id) ────────────
 const partners = inbox
  .map((item) => {
   const msg = item.lastMessage;
   const other = msg.senderId === myId ? msg.receiver : msg.sender;
   return { user: other as ChatUser, lastMessage: msg, unreadCount: item.unreadCount };
  })
  .filter((p) => p.user)
  .filter(
   (p, i, arr) => arr.findIndex((x) => x.user.id === p.user.id) === i,
  )
  .filter(
   (p) =>
    !search || p.user.name.toLowerCase().includes(search.toLowerCase()),
  )
  .sort((a, b) => {
   // Prioritaskan yang punya unread, lalu urut dari pesan terbaru
   if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
   return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

 const totalUnread = inbox.reduce((sum, i) => sum + i.unreadCount, 0);

 return (
  <div className="flex-1 bg-[#f8f9fa] text-[#191c1d] antialiased flex flex-col min-h-0 overflow-hidden">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e1e3e4; border-radius: 10px; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    .dot-bounce { animation: bounce 1s infinite; }
   `}</style>

   {/* Main workspace */}
   <main className="flex-1 lg:ml-64 flex min-h-0 overflow-hidden">
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
    <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#f8f9fa]">
     {!partner ? (
      <div className="flex-1 flex flex-col items-center justify-center text-[#404944] gap-3">
       <span className="material-symbols-outlined text-6xl opacity-30">forum</span>
       <p className="text-sm">Pilih percakapan untuk mulai membalas</p>
      </div>
     ) : (
      <>
       {/* Thread header */}
       <header className="h-16 px-6 border-b border-[#e1e3e4] bg-white flex items-center justify-between flex-shrink-0">
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
        <button onClick={() => setShowOrderModal(true)}
         className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003527] text-white text-xs font-semibold rounded-lg hover:bg-[#064e3b] transition-all">
         <span className="material-symbols-outlined text-base">add_shopping_cart</span>
         Buat Pesanan
        </button>
       </header>

       {/* Messages */}
       <div className="relative flex-1 min-h-0">
        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-1">
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
       </div>
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

   {/* Order Modal */}
   {showOrderModal && partner && (
    <>
     <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowOrderModal(false)} />
     <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-5">
       <h3 className="text-lg font-bold text-[#191c1d]">Buat Pesanan</h3>
       <button onClick={() => setShowOrderModal(false)} className="p-1 text-[#707974] hover:text-[#191c1d]">
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <p className="text-sm text-[#707974] mb-5">Pesanan untuk: <strong className="text-[#191c1d]">{partner.name}</strong></p>

      <div className="space-y-4">
       {/* Product search / picker */}
       <div>
        <label className="block text-xs font-semibold text-[#707974] mb-1">Cari Produk</label>
        <div className="relative">
         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bfc9c3] text-lg">search</span>
         <input type="text" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setShowProductPicker(true); }}
          className="w-full border border-[#bfc9c3] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none" placeholder="Ketik nama produk..." />
        </div>
        {showProductPicker && productResults.length > 0 && (
         <div className="mt-2 max-h-40 overflow-y-auto border border-[#e1e3e4] rounded-lg divide-y divide-[#e1e3e4]">
          {productResults.map((p) => (
           <button key={p.id} type="button" onClick={() => {
            setSelectedProduct({ id: p.id, name: p.name, price: p.price });
            setOrderProduct(p.name);
            setOrderPrice(String(p.price));
            setProductSearch(p.name);
            setShowProductPicker(false);
           }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f3f4f5] transition-colors flex items-center justify-between ${
             selectedProduct?.id === p.id ? "bg-[#d9dff5]" : ""
            }`}>
            <span className="font-medium text-[#191c1d] truncate">{p.name}</span>
            <span className="text-[#003527] font-semibold shrink-0 ml-2">Rp {Number(p.price).toLocaleString("id-ID")}</span>
           </button>
          ))}
         </div>
        )}
       </div>

       {/* Ketika produk dari database dipilih, sembunyikan input manual */}
       {!selectedProduct && (
        <div className="grid grid-cols-2 gap-3">
         <div>
          <label className="block text-xs font-semibold text-[#707974] mb-1">Nama Produk (manual)</label>
          <input type="text" value={orderProduct} onChange={(e) => setOrderProduct(e.target.value)}
           className="w-full border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none" placeholder="Contoh: Sampo Baru" />
         </div>
         <div>
          <label className="block text-xs font-semibold text-[#707974] mb-1">Harga (Rp)</label>
          <input type="text" value={orderPrice} onChange={(e) => setOrderPrice(e.target.value)}
           className="w-full border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none" placeholder="200000" />
         </div>
        </div>
       )}

       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="block text-xs font-semibold text-[#707974] mb-1">Jumlah</label>
         <input type="number" min={1} value={orderQty} onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
          className="w-full border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none" />
        </div>
        <div>
         <label className="block text-xs font-semibold text-[#707974] mb-1">Tipe (opsional)</label>
         <input type="text" value={orderTipe} onChange={(e) => setOrderTipe(e.target.value)}
          className="w-full border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none" placeholder="Baru, Premium" />
        </div>
       </div>

       {/* Ringkasan */}
       {(selectedProduct || (orderProduct && orderPrice)) && (
        <div className="bg-[#f3f4f5] rounded-lg p-4 text-sm">
         <p className="font-semibold text-[#191c1d]">Ringkasan</p>
         <div className="mt-2 space-y-1 text-[#404944]">
          <p>{selectedProduct?.name || orderProduct}{orderTipe ? ` (${orderTipe})` : ""}</p>
          <p>{orderQty} x Rp {(selectedProduct ? Number(selectedProduct.price) : Number(orderPrice.replace(/[^0-9]/g, ""))).toLocaleString("id-ID")}</p>
          <p className="font-bold text-[#003527] text-base">Total: Rp {((selectedProduct ? Number(selectedProduct.price) : Number(orderPrice.replace(/[^0-9]/g, ""))) * orderQty).toLocaleString("id-ID")}</p>
         </div>
        </div>
       )}
      </div>

      <div className="flex gap-3 mt-6">
       <button onClick={() => setShowOrderModal(false)}
        className="flex-1 border border-[#bfc9c3] text-[#404944] font-semibold text-sm py-2.5 rounded-lg hover:bg-[#f3f4f5] transition-all">
        Batal
       </button>
       <button onClick={handleCreateOrder} disabled={orderLoading || !orderProduct.trim() || !orderPrice.trim()}
        className="flex-1 bg-[#003527] text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-[#064e3b] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {orderLoading ? (
         <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Membuat...</>
        ) : "Buat Pesanan"}
       </button>
      </div>
     </div>
    </>
   )}
  </div>
 );
}
