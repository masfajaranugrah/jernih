"use client";

import Image from "next/image";
import { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";

const chatList = [
  {
    id: 1,
    name: "John Doe",
    subject: "Order Issue: #ORD-2023-8912",
    preview: "I received the wrong color for the vase...",
    time: "10:42 AM",
    status: "New",
    statusColor: "bg-[#ffdad6] text-[#93000a]",
    active: true,
    unread: true,
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    subject: "Shipping Delay Inquiry",
    preview: "When will my tracking update?",
    time: "Yesterday",
    status: "Pending",
    statusColor: "bg-[#d9dff5] text-[#5c6274]",
    active: false,
    unread: false,
  },
  {
    id: 3,
    name: "Michael Chang",
    subject: "Product Question",
    preview: "Are the ceramic plates dishwasher safe?",
    time: "Monday",
    status: "Resolved",
    statusColor: "bg-[#e1e3e4] text-[#404944]",
    active: false,
    unread: false,
  },
];

const quickActions = [
  { label: "Issue Refund", icon: "payments" },
  { label: "Create Return Label", icon: "local_shipping" },
  { label: "Offer Discount Code", icon: "loyalty" },
];

export default function ChatPage() {
  const [message, setMessage] = useState("");

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
        <aside className="w-72 xl:w-80 bg-white border-r border-[#e1e3e4] flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-5 border-b border-[#e1e3e4] bg-[#f8f9fa]">
            <h2 className="text-[#191c1d] font-semibold text-2xl mb-3">Active Inquiries</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#404944] text-lg">search</span>
              <input
                className="w-full pl-9 pr-3 py-2.5 bg-[#e1e3e4] border-none rounded-lg text-sm focus:ring-1 focus:ring-[#003527] focus:bg-white transition-colors outline-none"
                placeholder="Search chats..."
                type="text"
              />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              <button className="px-3 py-1 rounded-full bg-[#064e3b] text-[#80bea6] text-xs font-semibold whitespace-nowrap">All (12)</button>
              <button className="px-3 py-1 rounded-full bg-[#edeeef] text-[#404944] hover:bg-[#e1e3e4] text-xs font-semibold whitespace-nowrap">New (3)</button>
              <button className="px-3 py-1 rounded-full bg-[#edeeef] text-[#404944] hover:bg-[#e1e3e4] text-xs font-semibold whitespace-nowrap">Pending (8)</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {chatList.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left p-3 rounded-lg relative group transition-all ${
                  chat.active
                    ? "bg-[#f3f4f5] border border-[#003527]/20"
                    : "hover:bg-[#f3f4f5] border border-transparent"
                }`}
              >
                {chat.active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#003527] rounded-r-full" />
                )}
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-[#191c1d]">{chat.name}</span>
                  <span className="text-xs text-[#404944]">{chat.time}</span>
                </div>
                <p className="text-xs font-semibold text-[#003527] mb-1">{chat.subject}</p>
                <p className="text-xs text-[#404944] truncate">{chat.preview}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${chat.statusColor}`}>
                    {chat.status}
                  </span>
                  {chat.unread && <span className="w-2 h-2 rounded-full bg-[#003527]" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center panel: chat thread */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] relative">
          {/* Thread header */}
          <header className="h-16 px-6 border-b border-[#e1e3e4] bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-[#191c1d] font-semibold text-xl leading-none">John Doe</h2>
              <span className="text-xs text-[#404944]">Order Issue: #ORD-2023-8912</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-[#e7e8e9] text-[#404944] transition-colors" title="Transfer Chat">
                <span className="material-symbols-outlined">swap_horiz</span>
              </button>
              <button className="p-2 rounded-full hover:bg-[#e7e8e9] text-[#404944] transition-colors" title="Mark as Resolved">
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5">
            {/* System message */}
            <div className="flex justify-center">
              <span className="text-xs text-[#404944] bg-[#f3f4f5] px-3 py-1 rounded-full shadow-sm">Chat started at 10:40 AM</span>
            </div>

            {/* Customer message */}
            <div className="flex items-end gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[#d9dff5] flex items-center justify-center flex-shrink-0 text-[#5c6274] text-xs font-bold">JD</div>
              <div className="bg-white border border-[#e1e3e4] rounded-2xl rounded-bl-none p-3 shadow-sm">
                <p className="text-sm text-[#191c1d]">Hello, I received my order #ORD-2023-8912 today, but the Emerald Ceramic Vase I ordered is actually the Slate Grey version.</p>
                <span className="text-xs text-[#404944] block mt-1 text-right opacity-70">10:42 AM</span>
              </div>
            </div>

            {/* Customer message with image */}
            <div className="flex items-end gap-3 max-w-[80%]">
              <div className="w-8 h-8 flex-shrink-0" />
              <div className="bg-white border border-[#e1e3e4] rounded-2xl p-3 shadow-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCxQzHteERceaaA9ul9gEzjwhc3-0U-WG8no5nk_3qxx-H9orle9qfY-QpEWAh8FCRc7k7wgcMxb3nIGJ6bGWg46rRbeVIhB86bxUyBsvn59U2gEjGCzT0T14sVxqpE-9xz0pnG3DjRVUqWR6_eqJtFWARgeYdvB_htb-RAy9-VU2m4z6rhkLXxdhmhI5VuhKCp80TCCjsIvdqV0MTR4pqk1rD6mQpbs--dZm3Kce4paKMQDjZTnN1"
                  alt="Customer photo of wrong item"
                  width={256}
                  height={180}
                  className="rounded-lg object-cover border border-[#e1e3e4]/30"
                />
                <p className="text-sm text-[#191c1d] mt-2">Here is a photo of what I received.</p>
                <span className="text-xs text-[#404944] block mt-1 text-right opacity-70">10:43 AM</span>
              </div>
            </div>

            {/* Admin typing indicator */}
            <div className="flex items-end justify-end gap-3 max-w-[80%] self-end">
              <div className="bg-[#003527] text-white rounded-2xl rounded-br-none p-3 shadow-sm">
                <div className="flex gap-1 items-center h-4 px-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full dot-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-1.5 h-1.5 bg-white rounded-full dot-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-1.5 h-1.5 bg-white rounded-full dot-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-[#e1e3e4] z-10">
            <div className="flex gap-2 items-end bg-white border border-[#bfc9c3] rounded-xl px-2 py-1 shadow-sm focus-within:border-[#003527] focus-within:ring-1 focus-within:ring-[#003527] transition-all">
              <button className="p-2 text-[#404944] hover:text-[#003527] transition-colors flex-shrink-0" title="Attach file">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-[#191c1d] py-2 outline-none max-h-32"
                placeholder="Type a message to John..."
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex gap-1 items-center pb-1">
                <button className="p-2 text-[#404944] hover:text-[#003527] transition-colors flex-shrink-0" title="Quick responses">
                  <span className="material-symbols-outlined">bolt</span>
                </button>
                <button className="p-2 bg-[#003527] text-white rounded-lg hover:bg-[#064e3b] transition-colors flex-shrink-0 shadow-sm" title="Send message">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-[#404944] mt-1.5 px-1">
              Press <kbd className="px-1 bg-[#edeeef] rounded border border-[#bfc9c3] text-[10px]">Enter</kbd> to send,{" "}
              <kbd className="px-1 bg-[#edeeef] rounded border border-[#bfc9c3] text-[10px]">Shift + Enter</kbd> for new line.
            </p>
          </div>
        </section>

        {/* Right panel: context sidebar */}
        <aside className="w-72 xl:w-80 bg-white border-l border-[#e1e3e4] flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar hidden lg:flex">
          {/* Customer profile */}
          <div className="p-8 border-b border-[#e1e3e4] flex flex-col items-center text-center bg-[#f8f9fa]">
            <div className="w-20 h-20 rounded-full bg-[#064e3b] text-[#80bea6] flex items-center justify-center font-bold text-3xl shadow-sm mb-3 border-2 border-white">
              JD
            </div>
            <h3 className="text-[#191c1d] font-semibold text-2xl">John Doe</h3>
            <span className="inline-flex items-center gap-1 px-2 py-1 mt-2 rounded bg-[#2b6954]/10 text-[#2b6954] text-xs font-semibold border border-[#2b6954]/20">
              <span className="material-symbols-outlined text-sm">star</span>
              Premium Member
            </span>
            <div className="flex gap-4 mt-5 w-full">
              <div className="flex-1 bg-[#f3f4f5] p-3 rounded-lg border border-[#e1e3e4]/50">
                <p className="text-xs text-[#404944] mb-1">Total Orders</p>
                <p className="text-xl font-bold text-[#191c1d]">14</p>
              </div>
              <div className="flex-1 bg-[#f3f4f5] p-3 rounded-lg border border-[#e1e3e4]/50">
                <p className="text-xs text-[#404944] mb-1">Lifetime Value</p>
                <p className="text-xl font-bold text-[#191c1d]">$1,240</p>
              </div>
            </div>
          </div>

          {/* Order context */}
          <div className="p-5 border-b border-[#e1e3e4]">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-[#191c1d] uppercase tracking-wide">Context: Last Order</h4>
              <button className="text-xs font-semibold text-[#003527] hover:underline">View Full</button>
            </div>
            <div className="bg-[#f3f4f5] rounded-lg p-3 border border-[#e1e3e4]/50">
              <p className="text-xs text-[#404944] mb-1">Order #ORD-2023-8912</p>
              <p className="text-xs text-[#191c1d] mb-3">Placed on: Oct 24, 2023</p>
              {[
                {
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDr5kAvCRgA0oFoHIBOLVR0v3HX9AryHAWLPlYHJbRcHWmi3tmgmjsMyrN6fuVQsXmOSNhiNYgNrn77A2msM4Vf7NypgwKhKcOLvgNPVUwPOxm7RQpo3ekWFOgIIgZ6csoMLkZtQiaamfUkvT5QyVfqMFIjoVVWZz2hc4LuUVmZ4_QtOhh1dp4knVW5f39wfqjqmK6suH5ZGotAK6lGbcz8DVpb02DkFnNzYeZhu65oIOqbiaAZm-r2",
                  name: "Ceramic Vase - Slate Grey",
                  price: "$85.00 · Qty: 1",
                },
                {
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYg7y6CAmcJUH8OlLnO3Nh1P_QlzK6ijchRlPEzbCUeCB-anIR8mt9p6eUxZXqvQcCGpVhbKPAoIvUz2uHnsMUcaQE09wepWaKBcpo8VvOUD5aX3nW-lvH1rfGFOJHAZrd4ICOmnFFiPPyNxecoi_iF-0m9ruHHzzvrIpA1D4D9GELBEoTMAROsVd-WLmFoKK8El5VEVwqp90YxNwJo65ZQH1LEFRlULG3aI2MlBdbc6WSm2MyzzJn",
                  name: "Linen Napkin Set - Natural",
                  price: "$45.00 · Qty: 2",
                },
              ].map((item) => (
                <div key={item.name} className="flex gap-3 items-center py-2 border-t border-[#e1e3e4]/30">
                  <div className="w-12 h-12 bg-white rounded flex-shrink-0 border border-[#e1e3e4]/50 overflow-hidden">
                    <Image src={item.img} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#191c1d] truncate">{item.name}</p>
                    <p className="text-xs text-[#404944]">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="p-5 flex-1">
            <h4 className="text-xs font-bold text-[#191c1d] uppercase tracking-wide mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[#f8f9fa] border border-[#e1e3e4] hover:border-[#003527] hover:text-[#003527] transition-colors group"
                >
                  <span className="text-sm font-semibold">{action.label}</span>
                  <span className="material-symbols-outlined text-[#404944] group-hover:text-[#003527] transition-colors text-xl">{action.icon}</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <button className="w-full py-3 px-5 rounded-lg bg-[#003527] text-white text-sm font-semibold hover:bg-[#064e3b] transition-colors shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Mark as Resolved
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
