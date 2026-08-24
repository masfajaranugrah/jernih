"use client";

import { useEffect, useRef } from "react";

export type OrderHistoryEvent = {
  /** Waktu event dalam format ISO string */
  timestamp: string;
  /** Judul status, misal: "Pesanan sedang dikirim" */
  title: string;
  /** Deskripsi singkat */
  description: string;
  /**
   * Tandai event ini sebagai status yang sedang aktif/berlangsung saat ini.
   * Hanya satu event yang boleh bernilai true.
   */
  isCurrent?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  events: OrderHistoryEvent[];
  /** Judul modal, default: "Detail Pengiriman" */
  title?: string;
};

function formatTimelineDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
  return { date, time };
}

export default function OrderHistoryModal({
  open,
  onClose,
  events,
  title = "Detail Pengiriman",
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Tutup modal saat tekan Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Blokir scroll body saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Klik backdrop (area di luar modal)
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Tentukan index event yang aktif: pakai isCurrent jika ada, fallback ke index 0
  const activeIdx = events.findIndex((e) => e.isCurrent);
  const currentIdx = activeIdx !== -1 ? activeIdx : 0;

  return (
    <>
      {/* Overlay + animasi */}
      <div
        ref={overlayRef}
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-label={title}
        className={[
          "fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4",
          "transition-opacity ease-in-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ transitionDuration: "250ms" }}
      >
        {/* Dialog */}
        <div
          className={[
            "w-full max-w-md max-h-[88vh] flex flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
            "transition-all ease-in-out",
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0",
          ].join(" ")}
          style={{ transitionDuration: "250ms" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05L6.64 18.36A9.001 9.001 0 1 0 13 3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
              </span>
              <h2 className="text-base font-bold text-[#191c1d]">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#707974] transition hover:bg-[#f3f4f5] hover:text-[#191c1d]"
              aria-label="Tutup"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {events.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#94a3b8]">
                Belum ada riwayat pesanan.
              </p>
            ) : (
              <ol className="relative">
                {events.map((event, idx) => {
                  const isActive = idx === currentIdx;
                  const isLast = idx === events.length - 1;
                  const isPast = idx > currentIdx; // lebih tua dari status aktif
                  const { date, time } = formatTimelineDate(event.timestamp);

                  return (
                    <li key={idx} className="flex gap-4">
                      {/* Kolom kiri: tanggal + jam */}
                      <div className="w-[88px] shrink-0 pt-0.5 text-right">
                        <p
                          className={[
                            "text-[11px] font-semibold leading-tight",
                            isActive
                              ? "text-[#064e3b]"
                              : isPast
                              ? "text-[#bfc9c3]"
                              : "text-[#707974]",
                          ].join(" ")}
                        >
                          {date}
                        </p>
                        <p
                          className={[
                            "mt-0.5 text-[11px]",
                            isActive
                              ? "font-bold text-[#064e3b]"
                              : isPast
                              ? "text-[#d4d9d6]"
                              : "text-[#94a3b8]",
                          ].join(" ")}
                        >
                          {time}
                        </p>
                      </div>

                      {/* Kolom tengah: indikator + garis vertikal */}
                      <div className="flex flex-col items-center">
                        {isActive ? (
                          /* Status aktif: dot besar + ping */
                          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#064e3b] opacity-30" />
                            <span className="relative h-4 w-4 rounded-full bg-[#064e3b] ring-2 ring-[#064e3b]/30 ring-offset-2" />
                          </span>
                        ) : isPast ? (
                          /* Status lama (sudah dilewati): dot abu-abu */
                          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[#d4d9d6] bg-[#f3f4f5]" />
                        ) : (
                          /* Status sebelum aktif (sudah terjadi, lebih baru): dot solid hijau kecil */
                          <span className="h-3 w-3 shrink-0 rounded-full bg-[#064e3b]/60" />
                        )}

                        {/* Garis vertikal ke bawah */}
                        {!isLast && (
                          <div
                            className={[
                              "mt-1 w-0.5 flex-1 min-h-[28px]",
                              isPast ? "bg-[#e8eceb]" : "bg-[#e2e8f0]",
                            ].join(" ")}
                          />
                        )}
                      </div>

                      {/* Kolom kanan: teks */}
                      <div className={["min-w-0 flex-1", isLast ? "pb-0" : "pb-6"].join(" ")}>
                        <p
                          className={[
                            "text-sm font-bold leading-snug",
                            isActive
                              ? "text-[#064e3b]"
                              : isPast
                              ? "text-[#bfc9c3]"
                              : "text-[#191c1d]",
                          ].join(" ")}
                        >
                          {event.title}
                        </p>
                        <p
                          className={[
                            "mt-0.5 text-xs leading-relaxed",
                            isPast ? "text-[#d4d9d6]" : "text-[#707974]",
                          ].join(" ")}
                        >
                          {event.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[#e2e8f0] px-5 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d] active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
