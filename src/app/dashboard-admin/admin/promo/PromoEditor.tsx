"use client";

import { useState, useTransition, useMemo } from "react";
import {
  createPromo,
  removePromo,
  fetchAllItemsForPromo,
  type PromoPickerItem,
  type PromoItemType,
  type PromoCard,
} from "@/lib/promo-actions";
import { getToken } from "@/lib/auth";

type Props = { initial: PromoCard[] };

const TYPE_LABELS: Record<PromoItemType, string> = {
  produk: "Produk",
  jasa: "Jasa",
  sewa: "Sewa",
};

const TYPE_ICONS: Record<PromoItemType, string> = {
  produk: "inventory_2",
  jasa: "design_services",
  sewa: "handshake",
};

const TYPE_COLORS: Record<PromoItemType, string> = {
  produk: "bg-blue-50 text-blue-700 border-blue-200",
  jasa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sewa: "bg-orange-50 text-orange-700 border-orange-200",
};

// ── Picker Modal ──────────────────────────────────────────────────────────────
function ItemPickerModal({
  allItems,
  onSelect,
  onClose,
}: {
  allItems: PromoPickerItem[];
  onSelect: (item: PromoPickerItem) => void;
  onClose: () => void;
}) {
  const [activeType, setActiveType] = useState<PromoItemType | "semua">("semua");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (activeType !== "semua" && item.type !== activeType) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allItems, activeType, search]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { semua: allItems.length };
    for (const item of allItems) {
      c[item.type] = (c[item.type] ?? 0) + 1;
    }
    return c;
  }, [allItems]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e1e3e4] px-6 py-4">
          <div>
            <h3 className="font-bold text-[#191c1d] text-lg">Pilih Item untuk Promo</h3>
            <p className="text-xs text-[#707974] mt-0.5">{allItems.length} item tersedia</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#707974] hover:bg-[#edeeef] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-[#e1e3e4] px-6 py-3 overflow-x-auto">
          {(["semua", "produk", "jasa", "sewa"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                activeType === t
                  ? "bg-[#003527] text-white border-[#003527]"
                  : "bg-white text-[#707974] border-[#bfc9c3] hover:border-[#003527] hover:text-[#003527]"
              }`}
            >
              {t !== "semua" && (
                <span className="material-symbols-outlined text-xs">{TYPE_ICONS[t]}</span>
              )}
              {t === "semua" ? "Semua" : TYPE_LABELS[t]}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeType === t ? "bg-white/20" : "bg-[#f3f4f5]"
              }`}>
                {counts[t] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-[#e1e3e4]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#707974] text-base">search</span>
            <input
              type="text"
              placeholder="Cari nama item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20"
            />
          </div>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-[#bfc9c3] mb-3">search_off</span>
              <p className="font-semibold text-[#404944]">Tidak ada item</p>
              <p className="mt-1 text-sm text-[#707974]">
                {allItems.length === 0
                  ? "Tambahkan produk, jasa, atau item sewa terlebih dahulu"
                  : "Coba kata kunci lain"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => onSelect(item)}
                  className="group flex items-center gap-3 rounded-xl border border-[#e1e3e4] bg-white p-3 text-left transition-all hover:border-[#003527] hover:shadow-md active:scale-[0.98]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#edeeef]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-[#bfc9c3]">
                          {TYPE_ICONS[item.type]}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-[#191c1d] group-hover:text-[#003527]">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-[#064e3b] mt-0.5">{item.priceLabel}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_COLORS[item.type]}`}>
                      {TYPE_LABELS[item.type]} · {item.category}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#bfc9c3] text-base group-hover:text-[#003527]">
                    add_circle
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Komponen utama PromoEditor ─────────────────────────────────────────────────
export default function PromoEditor({ initial }: Props) {
  const [promos, setPromos] = useState<PromoCard[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  const [allItems, setAllItems] = useState<PromoPickerItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // Fetch semua item saat picker dibuka
  async function openPicker() {
    setShowPicker(true);
    if (allItems.length === 0) {
      setLoadingItems(true);
      try {
        const items = await fetchAllItemsForPromo();
        setAllItems(items);
      } finally {
        setLoadingItems(false);
      }
    }
  }

  function handleSelect(item: PromoPickerItem) {
    setShowPicker(false);
    // Cek duplikat
    if (promos.some((p) => p.linkHref === item.linkHref)) {
      flash("⚠️ Item ini sudah ada di daftar promo");
      return;
    }

    const token = getToken();
    if (!token) { flash("❌ Token tidak ditemukan, login ulang"); return; }

    const data: Omit<PromoCard, "id"> = {
      title: item.name,
      category: item.category,
      price: item.priceLabel,
      image: item.image,
      linkHref: item.linkHref,
    };

    startTransition(async () => {
      const updated = await createPromo(data, token);
      setPromos(updated);
      flash("✓ Promo berhasil ditambahkan");
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus promo "${title}"?`)) return;
    const token = getToken();
    if (!token) { flash("❌ Token tidak ditemukan, login ulang"); return; }

    startTransition(async () => {
      const updated = await removePromo(id, token);
      setPromos(updated);
      flash("✓ Promo dihapus");
    });
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[200] rounded-xl bg-[#003527] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Picker modal */}
      {showPicker && (
        <ItemPickerModal
          allItems={loadingItems ? [] : allItems}
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1d]">Promo Spesial</h2>
          <p className="mt-1 text-sm text-[#707974]">
            Pilih produk, jasa, atau item sewa yang akan ditampilkan di halaman utama. Maks. 6 kartu.
          </p>
        </div>
        {promos.length < 6 && (
          <button
            onClick={openPicker}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#043b2d] transition-all disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Tambah Promo
          </button>
        )}
      </div>

      {/* Daftar promo aktif */}
      {promos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#bfc9c3] py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">local_offer</span>
          <p className="font-semibold text-[#404944] text-lg">Belum ada promo</p>
          <p className="mt-1 text-sm text-[#707974]">Klik &quot;Tambah Promo&quot; untuk memilih item dari database</p>
          <button
            onClick={openPicker}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#043b2d] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Pilih Item Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo, idx) => (
            <div
              key={promo.id}
              className="group relative overflow-hidden rounded-xl border border-[#e1e3e4] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card preview */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#edeeef]">
                {promo.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-[#bfc9c3]">image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[11px] font-black text-white">
                  {idx + 1}
                </span>
                <span className="absolute left-10 top-3 rounded-full bg-[#575e70] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  PROMO
                </span>
                {promo.category && (
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#191c1d]">
                    {promo.category}
                  </span>
                )}
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <p className="line-clamp-1 text-sm font-bold">{promo.title}</p>
                  <p className="mt-0.5 text-lg font-black text-[#b0f0d6]">{promo.price}</p>
                </div>
              </div>

              {/* Footer card */}
              <div className="flex items-center justify-between border-t border-[#e1e3e4] bg-[#f8f9fa] px-4 py-3">
                <span className="max-w-[140px] truncate text-[11px] text-[#707974]">
                  {promo.linkHref}
                </span>
                <button
                  onClick={() => handleDelete(promo.id, promo.title)}
                  disabled={isPending}
                  className="rounded-lg p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors disabled:opacity-40"
                  title="Hapus dari promo"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* Slot kosong + tombol tambah */}
          {promos.length < 6 && (
            <button
              onClick={openPicker}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#bfc9c3] bg-white py-10 text-center transition-colors hover:border-[#064e3b] hover:bg-[#064e3b]/5 group"
            >
              <span className="material-symbols-outlined text-4xl text-[#bfc9c3] group-hover:text-[#064e3b] transition-colors mb-2">
                add_circle
              </span>
              <p className="text-sm font-semibold text-[#707974] group-hover:text-[#064e3b] transition-colors">
                Tambah Promo
              </p>
              <p className="mt-0.5 text-xs text-[#bfc9c3]">{6 - promos.length} slot tersisa</p>
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-[#064e3b]/15 bg-[#064e3b]/5 p-4">
        <span className="material-symbols-outlined text-[#064e3b] text-xl flex-shrink-0">info</span>
        <p className="text-xs leading-relaxed text-[#003527]">
          Perubahan langsung tersimpan ke database dan tampil di halaman utama.
          Pilih item dari <strong>Produk</strong>, <strong>Jasa</strong>, atau <strong>Sewa</strong> yang sudah ada.
          Maksimal <strong>6 kartu</strong>.
        </p>
      </div>
    </div>
  );
}
