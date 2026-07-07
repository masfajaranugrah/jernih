"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteService, type ApiService } from "@/lib/service-actions";
import { useToast } from "@/app/dashboard-admin/components/Toast";

function formatRupiah(val: string | number) {
  return "Rp " + parseFloat(String(val)).toLocaleString("id-ID");
}

export default function ServicesAdminClient({ services }: { services: ApiService[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteService(id);
        success("Jasa berhasil dihapus");
        setConfirmId(null);
        router.refresh();
      } catch (err: unknown) {
        toastError("Gagal menghapus", err instanceof Error ? err.message : "Coba lagi.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  const active = services.filter((s) => s.isActive).length;
  const inactive = services.filter((s) => !s.isActive).length;

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Jasa", value: services.length, icon: "design_services", color: "text-[#003527]" },
          { label: "Aktif", value: active, icon: "check_circle", color: "text-green-600" },
          { label: "Nonaktif", value: inactive, icon: "pause_circle", color: "text-[#ba1a1a]" },
          { label: "Kategori", value: new Set(services.map((s) => s.category?.name ?? "—")).size, icon: "category", color: "text-[#575e70]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#e1e3e4] bg-white p-4 shadow-sm">
            <div className={`flex items-center gap-2 ${s.color}`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
              <span className="text-2xl font-black">{s.value}</span>
            </div>
            <p className="mt-1 text-xs text-[#707974]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e1e3e4] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e1e3e4] px-6 py-4">
          <h2 className="font-semibold text-[#191c1d]">Semua Jasa ({services.length})</h2>
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">design_services</span>
            <p className="font-semibold text-[#404944]">Belum ada jasa</p>
            <p className="mt-1 text-sm text-[#707974]">Klik &quot;Tambah Jasa&quot; untuk mulai</p>
            <Link href="/dashboard-admin/admin/services/new"
              className="mt-4 rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#043b2d] transition-colors">
              + Tambah Jasa Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e1e3e4] text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Jasa</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Kategori</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Satuan</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Harga Mulai</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#707974]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e3e4]">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-[#f3f4f5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {svc.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={svc.images[0]} alt={svc.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#edeeef] flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#edeeef] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#bfc9c3] text-xl">design_services</span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#191c1d]">{svc.name}</p>
                          <p className="text-[11px] text-[#707974] mt-0.5">/{svc.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#404944]">{svc.category?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-[#404944]">{svc.unit}</td>
                    <td className="px-4 py-4 font-semibold text-[#191c1d]">{formatRupiah(svc.priceFrom)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.isActive ? "bg-green-100 text-green-700" : "bg-[#ffdad6] text-[#ba1a1a]"
                      }`}>
                        {svc.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard-admin/admin/services/${svc.id}`}
                          className="p-1.5 rounded-lg hover:bg-[#e1e3e4] text-[#707974] hover:text-[#003527] transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </Link>
                        <button onClick={() => setConfirmId(svc.id)}
                          className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#707974] hover:text-[#ba1a1a] transition-colors" title="Hapus">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[#191c1d]">Hapus Jasa?</h3>
                <p className="text-xs text-[#707974]">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-[#bfc9c3] py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors">
                Batal
              </button>
              <button onClick={() => handleDelete(confirmId)} disabled={isPending && deletingId === confirmId}
                className="flex-1 rounded-xl bg-[#ba1a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#93000a] transition-colors disabled:opacity-60">
                {isPending && deletingId === confirmId ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
