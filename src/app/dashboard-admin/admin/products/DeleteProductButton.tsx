"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeProduct } from "@/lib/product-actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await removeProduct(id);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Hapus produk"
        className="rounded-lg p-2 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
      >
        <span className="material-symbols-outlined text-base">delete</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a]">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-[#191c1d]">Hapus Produk?</h3>
                <p className="text-xs text-[#707974]">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#404944] bg-[#f8f9fa] rounded-xl px-4 py-2.5">
              &ldquo;<span className="font-semibold">{name}</span>&rdquo; akan dihapus permanen.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[#bfc9c3] py-2.5 text-sm font-semibold text-[#191c1d] hover:bg-[#edeeef] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-[#ba1a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#93000a] transition-colors disabled:opacity-60"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
