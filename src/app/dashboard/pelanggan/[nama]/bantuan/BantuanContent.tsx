"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getChatSocket } from "@/lib/chatSocket";
import { getToken } from "@/lib/auth";
import {
  CATEGORY_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
} from "@/components/tickets/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const WA_FALLBACK = "6281318638100";

const CATEGORIES: TicketCategory[] = ["PEMBELIAN", "PENGIRIMAN", "LAINNYA"];
const PRIORITIES: TicketPriority[] = ["URGENT", "SEDANG", "LOW"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BantuanContent() {
  const router = useRouter();
  const pathname = usePathname();

  const [waNumber, setWaNumber] = useState(WA_FALLBACK);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal buat tiket
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<TicketCategory | null>(null);
  const [priority, setPriority] = useState<TicketPriority | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets", { cache: "no-store" });
      if (res.ok) setTickets(await res.json());
    } catch {
      // biarkan list kosong
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    // Nomor WA dari pengaturan toko (public endpoint)
    fetch(`${API}/settings/toko`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.whatsapp) setWaNumber(String(d.whatsapp).replace(/\D/g, ""));
      })
      .catch(() => {});
  }, [loadTickets]);

  // Realtime: refresh list saat ada update tiket
  useEffect(() => {
    const socket = getChatSocket(getToken() ?? undefined);
    const refresh = () => loadTickets();
    socket.on("ticket:message", refresh);
    socket.on("ticket:update", refresh);
    return () => {
      socket.off("ticket:message", refresh);
      socket.off("ticket:update", refresh);
    };
  }, [loadTickets]);

  const submitTicket = async () => {
    if (!category || !priority || !description.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, priority, description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal membuat tiket");
      router.push(`${pathname}/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2 kanal bantuan */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card WhatsApp */}
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo, saya butuh bantuan.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm transition hover:border-[#25D366]/50 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[#191c1d]">WhatsApp</h3>
            <p className="mt-1 text-sm text-[#707974]">
              Chat langsung dengan kami via WhatsApp untuk respons cepat.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#25D366]">
              Buka WhatsApp
              <span className="material-symbols-outlined text-base transition group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </span>
          </div>
        </a>

        {/* Card Live Chat */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group flex items-start gap-4 rounded-2xl border border-[#e1e3e4] bg-white p-6 text-left shadow-sm transition hover:border-[#003527]/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#003527]/10 text-[#003527]">
            <span className="material-symbols-outlined text-2xl">support_agent</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#191c1d]">Live Chat</h3>
            <p className="mt-1 text-sm text-[#707974]">
              Laporkan kendala Anda dan tim kami akan membantu lewat live chat.
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#003527]">
              Buat Tiket Kendala
              <span className="material-symbols-outlined text-base transition group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </span>
          </div>
        </button>
      </div>

      {/* Daftar tiket */}
      <div className="rounded-2xl border border-[#e1e3e4] bg-white shadow-sm">
        <div className="border-b border-[#e1e3e4] px-6 py-4">
          <h2 className="font-semibold text-[#191c1d]">Tiket Saya</h2>
        </div>
        <div className="divide-y divide-[#f0f1f2]">
          {loading && (
            <p className="px-6 py-8 text-center text-sm text-[#707974]">Memuat tiket...</p>
          )}
          {!loading && tickets.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-[#707974]">
              <span className="material-symbols-outlined text-4xl opacity-30">
                confirmation_number
              </span>
              <p className="text-sm">Belum ada tiket. Buat tiket lewat Live Chat di atas.</p>
            </div>
          )}
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => router.push(`${pathname}/${t.id}`)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-[#f8f9fa]"
            >
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f5] text-sm font-bold text-[#003527]">
                #{t.number}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#191c1d]">{t.subject}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-medium text-[#404944]">
                    {CATEGORY_LABEL[t.category]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[t.priority]}`}>
                    {PRIORITY_LABEL[t.priority]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                  <span className="text-[11px] text-[#707974]">{formatDate(t.createdAt)}</span>
                </div>
              </div>
              {(t.unreadCount ?? 0) > 0 && (
                <span className="flex min-w-5 h-5 shrink-0 items-center justify-center rounded-full bg-[#003527] px-1.5 text-[10px] font-bold text-white">
                  {t.unreadCount}
                </span>
              )}
              <span className="material-symbols-outlined shrink-0 text-[#c4c7c8]">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal buat tiket */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !submitting && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e1e3e4] px-5 py-4">
              <h3 className="font-semibold text-[#191c1d]">Buat Tiket Kendala</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                aria-label="Tutup"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#191c1d]">Jenis bantuan</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        category === c
                          ? "border-[#003527] bg-[#003527] text-white"
                          : "border-[#e1e3e4] text-[#404944] hover:border-[#003527]/40"
                      }`}
                    >
                      {CATEGORY_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#191c1d]">Prioritas</p>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        priority === p
                          ? "border-[#003527] bg-[#003527] text-white"
                          : "border-[#e1e3e4] text-[#404944] hover:border-[#003527]/40"
                      }`}
                    >
                      {PRIORITY_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#191c1d]">Kendala Anda</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Ceritakan kendala yang Anda alami..."
                  className="w-full resize-none rounded-xl border border-[#e1e3e4] bg-[#f8f9fa] p-3 text-sm outline-none transition focus:border-[#003527] focus:bg-white"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="button"
                onClick={submitTicket}
                disabled={!category || !priority || !description.trim() || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#003527] py-3 text-sm font-semibold text-white transition hover:bg-[#004d38] disabled:opacity-40"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">send</span>
                    Kirim Tiket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
