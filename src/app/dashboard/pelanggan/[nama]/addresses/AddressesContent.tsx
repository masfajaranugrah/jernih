"use client";

import { useEffect, useState, useCallback } from "react";

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

type FormState = {
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

const emptyForm: FormState = {
  label: "Rumah",
  recipient: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

const inputCls =
  "w-full rounded-lg border border-[#bfc9c3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527]";

export default function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/addresses", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal memuat alamat");
      }
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat alamat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setFormOpen(true);
    setError(null);
  }

  function openEdit(a: Address) {
    setEditingId(a.id);
    setForm({
      label: a.label,
      recipient: a.recipient,
      phone: a.phone,
      street: a.street,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      isDefault: a.isDefault,
    });
    setFormOpen(true);
    setError(null);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.recipient.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.province.trim() || !form.postalCode.trim()) {
      setError("Semua field wajib diisi (kecuali label).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message ?? "Gagal menyimpan alamat"
        );
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan alamat");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Address) {
    if (!confirm(`Hapus alamat "${a.label}" (${a.recipient})?`)) return;
    try {
      const res = await fetch(`/api/addresses/${a.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal menghapus alamat");
      }
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menghapus alamat");
    }
  }

  async function handleSetDefault(a: Address) {
    try {
      const res = await fetch(`/api/addresses/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal mengubah alamat utama");
      }
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal mengubah alamat utama");
    }
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-[#191c1d] font-semibold tracking-tight mb-1"
            style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}
          >
            Buku Alamat
          </h1>
          <p className="text-[#707974] text-base">
            Kelola alamat pengiriman Anda untuk checkout yang lebih cepat.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#003527] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#064e3b] transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_location_alt</span>
          Tambah Alamat
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#93000a]">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Tutup</button>
        </div>
      )}

      {/* Form tambah/edit */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#707974]">
              {editingId ? "Edit Alamat" : "Alamat Baru"}
            </h2>
            <button
              type="button"
              onClick={() => { setFormOpen(false); setEditingId(null); }}
              className="text-[#707974] hover:text-[#191c1d]"
              aria-label="Tutup form"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Label Alamat</label>
              <input
                type="text" className={inputCls} placeholder="Rumah / Kantor / Kos"
                value={form.label} onChange={(e) => set("label", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Nama Penerima *</label>
              <input
                type="text" className={inputCls} placeholder="Nama lengkap penerima"
                value={form.recipient} onChange={(e) => set("recipient", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">No. Telepon / WhatsApp *</label>
              <input
                type="tel" className={inputCls} placeholder="08xxxxxxxxxx"
                value={form.phone} onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Kode Pos *</label>
              <input
                type="text" className={inputCls} placeholder="12345"
                value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Alamat Lengkap *</label>
              <textarea
                rows={2} className={inputCls} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                value={form.street} onChange={(e) => set("street", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Kota / Kabupaten *</label>
              <input
                type="text" className={inputCls} placeholder="Jakarta Selatan"
                value={form.city} onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#404944]">Provinsi *</label>
              <input
                type="text" className={inputCls} placeholder="DKI Jakarta"
                value={form.province} onChange={(e) => set("province", e.target.value)}
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#404944]">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set("isDefault", e.target.checked)}
                className="h-4 w-4 rounded border-[#bfc9c3] accent-[#003527]"
              />
              Jadikan alamat utama
            </label>
          </div>
          <button
            type="submit" disabled={saving}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#003527] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#064e3b] transition-all disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Alamat"}
          </button>
        </form>
      )}

      {/* Daftar alamat */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-[#707974]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064e3b] border-t-transparent" />
          <span className="text-sm font-medium">Memuat alamat...</span>
        </div>
      ) : addresses.length === 0 && !formOpen ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">location_off</span>
          <p className="text-[#707974] text-base">Belum ada alamat tersimpan.</p>
          <button
            onClick={openAdd}
            className="mt-6 rounded-lg bg-[#003527] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#064e3b]"
          >
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border transition-all ${
                a.isDefault ? "border-[#003527]" : "border-transparent hover:border-[#bfc9c3]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#003527]">
                    {a.label.toLowerCase().includes("kantor") ? "apartment" : "home"}
                  </span>
                  <span className="font-bold text-[#191c1d]">{a.label}</span>
                  {a.isDefault && (
                    <span className="rounded-full bg-[#b0f0d6] px-2.5 py-0.5 text-[10px] font-bold text-[#003527]">
                      Utama
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-[#191c1d]">{a.recipient}</p>
              <p className="text-sm text-[#707974]">{a.phone}</p>
              <p className="mt-2 text-sm text-[#404944] leading-relaxed">
                {a.street}, {a.city}, {a.province} {a.postalCode}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-[#e1e3e4] pt-4">
                <button
                  onClick={() => openEdit(a)}
                  className="rounded-lg border border-[#bfc9c3] px-4 py-2 text-xs font-bold text-[#191c1d] hover:bg-[#f3f4f5] transition-colors"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(a)}
                      className="rounded-lg border border-[#bfc9c3] px-4 py-2 text-xs font-bold text-[#003527] hover:bg-[#f3f4f5] transition-colors"
                    >
                      Jadikan Utama
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      className="ml-auto rounded-lg px-4 py-2 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
