"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  from: "user" | "agent";
  text: string;
  time: string;
  status?: string;
};

type Conversation = {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  online?: boolean;
  unread?: boolean;
  icon?: string;
};

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Support Team",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd6Dhx2iJrauK4d92J8L_YhRYngzc4kzMr40XN1PRL2l26ooNN9L99yqELH1EPyCYVdeSfrBgo-DctoX4gR2a-H4VOHYKbzNAQbx666MjDmab_BpdyorMzXICBa4901AYvD99h0LmNQXorMyR9Qz9jgXmKK8pfb79f6Lo3Erco1cFiNx-z3HjGN5yUvBWhJKDSh7iwFY40sdY8sooMPt2ffLoqB0EzWayothMXWVvY8fcJq570PCeR",
    lastMsg: "Your order #1204 has been...",
    time: "10:45 AM",
    online: true,
    unread: true,
  },
  {
    id: 2,
    name: "Jernih Boutique Seller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXfuPGWPwj4POe2tGje2IIKMdS9afpIzK5fLXIeGyghaO9dTypVk5Bm8GAy6Y08ETKLSzW7VbwTjGTNfQGMRMZ0e4E5QY6Qa1ORo-aIK5Nhan1XR6t5PxcX77vWdKB9JhisnVucF3zI4DRykDt7QnvxUH9kapOU4hu6efZIheY0OjrnzIicNBWezaom2EsoyHASqhk1dyyXljTRyijMud-ANlzh5N1fvrj0RNzqBD3WmwRVzhUH-f8",
    lastMsg: "Thank you for your inquiry about the linen collection.",
    time: "Kemarin",
  },
  {
    id: 3,
    name: "Delivery Updates",
    avatar: "",
    icon: "local_shipping",
    lastMsg: "Package is out for delivery in your area.",
    time: "2 hari lalu",
  },
];

const initialMessages: Message[] = [
  {
    id: 1, from: "agent",
    text: "Halo! Terima kasih telah menghubungi Support JernihCreative. Ada yang bisa saya bantu hari ini?",
    time: "10:42 AM",
  },
  {
    id: 2, from: "user",
    text: "Halo! Saya ingin menanyakan pesanan #1204. Status masih 'Diproses' tapi saya butuh sebelum Jumat. Bisa dipercepat pengirimannya?",
    time: "10:44 AM",
    status: "Read",
  },
  {
    id: 3, from: "agent",
    text: "Saya sudah cek pesanan #1204 Anda. Karena Anda adalah Premium Member, saya bisa upgrade pengiriman ke Express tanpa biaya tambahan! Pesanan akan dikirim dalam 2 jam ke depan.",
    time: "10:45 AM",
  },
  {
    id: 4, from: "agent",
    text: "Link tracking terbaru sudah saya kirim ke email Anda.",
    time: "10:45 AM",
  },
];

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatContent() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = { id: Date.now(), from: "user", text, time: formatTime(), status: "Sent" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "agent", text: "Terima kasih! Ada hal lain yang bisa saya bantu?", time: formatTime() },
      ]);
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-xl border border-[#e1e3e4] shadow-sm bg-white">
      {/* Conversation list */}
      <div className="w-72 border-r border-[#e1e3e4] flex flex-col flex-shrink-0 bg-white">
        <div className="p-4 border-b border-[#e1e3e4]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#707974] uppercase tracking-wider">Percakapan</h3>
            <button className="text-[#003527] hover:opacity-80">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>
          {/* Story avatars */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {["Support", "Seller"].map((label, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className={`w-11 h-11 rounded-full border-2 p-0.5 ${i === 0 ? "border-[#003527]" : "border-[#bfc9c3]"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={conversations[i].avatar} alt={label}
                    className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-[10px] font-medium text-[#707974]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConv(conv.id)}
              className={`w-full text-left px-3 py-2 mx-1 rounded-xl flex gap-3 items-center transition-all ${
                activeConv === conv.id
                  ? "bg-[#f3f4f5] border-l-4 border-[#003527]"
                  : "hover:bg-[#f3f4f5]"
              }`}>
              <div className="w-11 h-11 rounded-full bg-[#edeeef] flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                {conv.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[#003527]">{conv.icon}</span>
                )}
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-sm text-[#191c1d] truncate">{conv.name}</h4>
                  <span className="text-[10px] text-[#707974] flex-shrink-0">{conv.time}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-[#003527] font-semibold" : "text-[#707974]"}`}>
                  {conv.lastMsg}
                </p>
              </div>
              {conv.unread && <div className="w-2 h-2 bg-[#003527] rounded-full flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-[#f8f9fa]">
        {/* Chat header */}
        <div className="h-16 px-6 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#064e3b] flex items-center justify-center text-[#80bea6]">
              <span className="material-symbols-outlined">headset_mic</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#191c1d]">Support Team</h3>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online • Balas dalam 5 menit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["videocam", "call", "more_vert"].map((icon) => (
              <button key={icon}
                className="p-2 hover:bg-[#f3f4f5] rounded-full transition-colors">
                <span className="material-symbols-outlined text-[#707974]">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          <div className="flex justify-center">
            <span className="text-[10px] uppercase tracking-widest text-[#707974] bg-[#edeeef] px-4 py-1 rounded-full font-bold">
              Hari ini
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id}
              className={`flex items-end gap-2 max-w-[78%] ${msg.from === "user" ? "self-end flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-[#edeeef] flex-shrink-0 overflow-hidden flex items-center justify-center">
                {msg.from === "agent" ? (
                  <span className="material-symbols-outlined text-[#003527] text-base">headset_mic</span>
                ) : (
                  <span className="material-symbols-outlined text-[#707974] text-base">person</span>
                )}
              </div>
              <div className={`flex flex-col gap-1 ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-4 text-sm shadow-sm ${
                  msg.from === "user"
                    ? "bg-[#003527] text-white rounded-[16px_16px_4px_16px]"
                    : "bg-white text-[#191c1d] rounded-[16px_16px_16px_4px] border border-[#e1e3e4]"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#707974]">
                  {msg.time}{msg.status ? ` • ${msg.status}` : ""}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2 max-w-[78%]">
              <div className="w-8 h-8 rounded-full bg-[#064e3b] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#80bea6] text-base">headset_mic</span>
              </div>
              <div className="bg-white border border-[#e1e3e4] rounded-[16px_16px_16px_4px] p-4 text-sm text-[#707974] italic shadow-sm">
                Support sedang mengetik...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t border-[#e1e3e4]">
          <div className="flex items-center gap-2 bg-[#f3f4f5] rounded-2xl px-3 py-2 focus-within:ring-2 ring-[#003527]/20 transition-all">
            <button className="p-1.5 hover:bg-[#edeeef] rounded-lg text-[#707974] transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button className="p-1.5 hover:bg-[#edeeef] rounded-lg text-[#707974] transition-colors">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 outline-none"
            />
            <button className="p-1.5 hover:bg-[#edeeef] rounded-lg text-[#707974] transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <button onClick={sendMessage}
              className="w-9 h-9 bg-[#003527] text-white rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-[#707974] mt-2 uppercase tracking-widest font-bold">
            End-to-end Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
