"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ImageLightbox from "./ImageLightbox";
import { formatChatTime, type ChatMessage } from "./types";

export default function MessageBubble({
  msg,
  own,
  onDelete,
}: {
  msg: ChatMessage;
  own: boolean;
  onDelete?: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const bubbleClass = own
    ? "bg-[#003527] text-white rounded-2xl rounded-br-md"
    : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md";

  // System message (notifikasi order, dll) — tampil di tengah
  if (msg.isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[85%] w-full bg-gradient-to-r from-[#064e3b]/5 via-[#003527]/10 to-[#064e3b]/5 rounded-xl border border-[#003527]/20 px-5 py-3.5 my-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#003527] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-white text-sm">verified</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#003527] uppercase tracking-wider mb-1">Sistem</p>
              <p className="text-sm text-[#191c1d] whitespace-pre-line leading-relaxed">{msg.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (msg.isDeleted) {
    return (
      <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
        <div className={`${bubbleClass} max-w-[75%] px-4 py-2.5`}>
          <p className="flex items-center gap-1.5 text-sm italic opacity-60">
            <span className="material-symbols-outlined text-base">block</span>
            Pesan telah dihapus
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`group flex items-end gap-1 ${own ? "justify-end" : "justify-start"}`}
      >
        {/* Menu hapus (hanya pesan sendiri) */}
        {own && onDelete && (
          <div className="relative order-first opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              aria-label="Opsi pesan"
            >
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(msg.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Hapus untuk semua
                </button>
              </div>
            )}
          </div>
        )}

        <div className={`${bubbleClass} max-w-[75%] overflow-hidden shadow-sm`}>
          {/* Card produk */}
          {msg.product && (
            <div className="p-1.5">
              <ProductCard product={msg.product} />
            </div>
          )}

          {/* Gambar */}
          {msg.imageUrl && (
            <button
              onClick={() => setLightbox(msg.imageUrl!)}
              className="w-full block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={msg.imageUrl}
                alt="Lampiran gambar"
                className="max-h-64 w-full cursor-pointer object-cover transition hover:opacity-95"
              />
            </button>
          )}

          {/* Video */}
          {msg.videoUrl && (
            <video
              src={msg.videoUrl}
              controls
              preload="metadata"
              className="max-h-64 w-full rounded-t-lg"
            />
          )}

          {/* Teks + waktu */}
          <div className="px-4 py-2.5">
            {msg.message && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {msg.message}
              </p>
            )}
            <div className={`mt-1 flex items-center gap-1.5 text-[10px] ${own ? "justify-end" : "justify-start"}`}>
              <span className={own ? "text-white/60" : "text-gray-400"}>
                {formatChatTime(msg.createdAt)}
              </span>
              {own && (
                <span className={msg.isRead ? "text-blue-300" : "text-white/40"}>
                  <span className="material-symbols-outlined text-[12px]">
                    {msg.isRead ? "done_all" : "done"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <ImageLightbox
          src={lightbox}
          alt="Lampiran gambar"
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
