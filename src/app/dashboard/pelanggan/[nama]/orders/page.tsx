"use client";

import { useState } from "react";

const tabs = ["Semua", "Belum Bayar", "Dikemas", "Dikirim", "Selesai"];

type OrderItem = {
  name: string;
  qty: number;
  price: number;
  img: string;
};

type Order = {
  id: string;
  status: "Dikirim" | "Selesai" | "Belum Bayar" | "Dikemas";
  items: OrderItem[];
  total: number;
  extraItems?: number;
};

const orders: Order[] = [
  {
    id: "ORD-202310-001",
    status: "Dikirim",
    total: 12500000,
    items: [
      {
        name: "Verdant Velvet Sofa",
        qty: 1,
        price: 12500000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdBarMGkW1_daf_VieL4bS_1f2lbynmFzbyW0dkvurmQI6JKBRwEplVnAISKGqRcCdwOsrpjw5ou5yNL6NcBpHOZQtNRWjkvEH8ckX42gV8362ggdjRG96weoPhVrXZrU9GabTRTPr99EbW45wHonUwuNZVxol-0LzXjPgseTfyDgek2igo9T1-S62Olk3pOb4I5E4rPAlM6rZtinG1Xq-diiKAisH0hzTeU2C-WhVYlhyD9eikq-Q",
      },
    ],
  },
  {
    id: "ORD-202309-045",
    status: "Selesai",
    total: 4200000,
    items: [
      {
        name: "Emerald Halo Ring Set",
        qty: 1,
        price: 4200000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpk-u7tO3quZesRRxpWyy-wyAQDbQgxUWOwaYGGU1f8iBZwyagMRc10LHinaXVruQL40T-LMvuygaE15IWgkkdJR2rm1l9UwoDdKkKs5c1goHQnE9JlXarBG3LYwZeG8EqbcE5PwlHF0LZmWjjgYKnfNIR2ChsrMJiPam1CjWIelzSQkKN4_eEMeU8QPgmwLceJx1ibORFU-epneDI8afRQPRqPJsW8Ta36uKuCDnSr4YlG6VDLnEU",
      },
    ],
  },
  {
    id: "ORD-202311-012",
    status: "Belum Bayar",
    total: 8150000,
    extraItems: 1,
    items: [
      {
        name: "Artisan Clay Vase",
        qty: 1,
        price: 850000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNwlZvYW2ybCi6N1SUnPu2EgZHkAOr3ZuLQHDtqilmCSzxuhhQs0Thgf3oUc9OvSOSQxlvd88hDtFpf1YgCogkkw42eaUb5zmjp1sAbr4F8hFmayfoaLJDDJOCR1AmhOgzZiUu_3tlabmb00UzbBhyMy4Uh0Ct9cuF5BAj-CRErbt2XdFlysVEb2IZni0tH6bA0rD5w3TMyAQIWTG6KZX-9UfCauO9ZVOUQgWath5XRQK_haBLLcK",
      },
      {
        name: "Teak Lounge Chair",
        qty: 2,
        price: 3500000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-qjM66uWigOVkn1ObMXP4c9aCfB2E691EKZBF7nwKXxxb4VT9X3zGBstpz5xmuvtRJf4vE_mZVKIs2b9-oeACXLbvOgdN2MEVFf6vzkevc8twgYYK7skTSha7g1R5GElfBYnn2yomjx73hQqUhAoyI9Dv-Zh-BiTLbI2nXaPczLorUYxMEKJK1_RXq81mz6gCeWDzwO1_6xVQA3VR9T6HBJ-F-tMfbuppWpvm3-rePMhGkhaVTGkg",
      },
    ],
  },
  {
    id: "ORD-202308-099",
    status: "Dikemas",
    total: 3750000,
    items: [
      {
        name: "Woven Rattan Side Table",
        qty: 1,
        price: 3750000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNwlZvYW2ybCi6N1SUnPu2EgZHkAOr3ZuLQHDtqilmCSzxuhhQs0Thgf3oUc9OvSOSQxlvd88hDtFpf1YgCogkkw42eaUb5zmjp1sAbr4F8hFmayfoaLJDDJOCR1AmhOgzZiUu_3tlabmb00UzbBhyMy4Uh0Ct9cuF5BAj-CRErbt2XdFlysVEb2IZni0tH6bA0rD5w3TMyAQIWTG6KZX-9UfCauO9ZVOUQgWath5XRQK_haBLLcK",
      },
    ],
  },
];

const statusConfig: Record<Order["status"], { badge: string }> = {
  Dikirim: { badge: "bg-[#d9dff5] text-[#5c6274]" },
  Selesai: { badge: "bg-[#e7e8e9] text-[#404944]" },
  "Belum Bayar": { badge: "bg-[#ffdad6] text-[#93000a]" },
  Dikemas: { badge: "bg-[#064e3b]/10 text-[#064e3b]" },
};

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID");
}

function SingleItemCard({ order }: { order: Order }) {
  const item = order.items[0];
  const cfg = statusConfig[order.status];

  return (
    <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#bfc9c3] transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5 border-b border-[#e1e3e4] pb-3">
          <span className="text-xs text-[#707974] font-medium">ID: {order.id}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            {order.status}
          </span>
        </div>
        <div className="flex gap-4 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.img}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg bg-[#edeeef] flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-[#191c1d] font-semibold text-lg leading-tight mb-1 truncate">
              {item.name}
            </h3>
            <p className="text-[#707974] text-sm">
              {item.qty} x {formatRupiah(item.price)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-[#e1e3e4]">
        <div>
          <p className="text-xs text-[#707974]">Total Belanja</p>
          <p className="text-[#003527] font-semibold text-xl">{formatRupiah(order.total)}</p>
        </div>
        {order.status === "Selesai" ? (
          <button className="border border-[#707974] text-[#191c1d] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#f3f4f5] transition-colors">
            Beli Lagi
          </button>
        ) : (
          <button className="bg-[#003527] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#064e3b] transition-colors">
            Lihat Detail
          </button>
        )}
      </div>
    </div>
  );
}

function MultiItemCard({ order }: { order: Order }) {
  const cfg = statusConfig[order.status];

  return (
    <div className="bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#bfc9c3] transition-all flex flex-col justify-between col-span-1 lg:col-span-2">
      <div>
        <div className="flex justify-between items-center mb-5 border-b border-[#e1e3e4] pb-3">
          <span className="text-xs text-[#707974] font-medium">ID: {order.id}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            {order.status}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 flex-1 items-center">
              {i > 0 && <div className="hidden md:block w-px bg-[#e1e3e4] self-stretch" />}
              <div className="flex gap-3 flex-1 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg bg-[#edeeef] flex-shrink-0"
                />
                <div>
                  <h4 className="text-[#191c1d] font-medium text-sm">{item.name}</h4>
                  <p className="text-[#707974] text-xs mt-0.5">
                    {item.qty} x {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {order.extraItems && order.extraItems > 0 && (
            <div className="flex items-center justify-center flex-1">
              <span className="text-xs text-[#707974] font-medium">
                +{order.extraItems} Produk Lainnya
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-[#e1e3e4]">
        <div>
          <p className="text-xs text-[#707974]">Total Belanja</p>
          <p className="text-[#003527] font-semibold text-xl">{formatRupiah(order.total)}</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-[#707974] text-[#191c1d] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#f3f4f5] transition-colors">
            Lihat Detail
          </button>
          {order.status === "Belum Bayar" && (
            <button className="bg-[#003527] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#064e3b] transition-colors">
              Bayar Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPelangganPage() {
  const [activeTab, setActiveTab] = useState("Semua");

  const filtered =
    activeTab === "Semua"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <>
      {/* Page heading */}
      <div className="mb-10">
        <h1
          className="text-[#191c1d] font-semibold tracking-tight mb-1"
          style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}
        >
          Pesanan Saya
        </h1>
        <p className="text-[#707974] text-base">
          Pantau status pesanan dan riwayat belanja Anda.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex overflow-x-auto gap-6 border-b border-[#bfc9c3] mb-8"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders bento grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">
            shopping_bag
          </span>
          <p className="text-[#707974] text-base">Tidak ada pesanan di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((order) =>
            order.items.length > 1 || order.extraItems ? (
              <MultiItemCard key={order.id} order={order} />
            ) : (
              <SingleItemCard key={order.id} order={order} />
            )
          )}
        </div>
      )}

      {/* Support FAB */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#003527] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        aria-label="Support"
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </>
  );
}
