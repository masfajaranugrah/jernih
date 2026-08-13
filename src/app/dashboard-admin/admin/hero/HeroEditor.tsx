"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHeroBanner, saveHeroBanner, deleteHeroBanner, resetHero } from "@/lib/hero-actions";
import type { HeroData, HeroBanner } from "@/lib/hero-store";

type Props = { initial: HeroData };

const defaultForm = {
  badge: "",
  title: "",
  titleSuffix: "",
  subtitle: "",
  tagline: "",
  description: "",
  ctaText: "",
  ctaColor: "",
  ctaTextColor: "",
  bgColor: "",
  imageUrl: "",
  imageAlt: "",
  linkHref: "",
  align: "left" as const,
  isActive: true,
};

export default function HeroEditor({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0); // 0 = Main, 1 = TopRight, 2 = BottomRight

  // Local state for banners list (split by position)
  const [banners, setBanners] = useState<HeroData>(initial);

  // Form State
  const [formData, setFormData] = useState<Partial<HeroBanner>>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null); // null means "Add New"
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper: Get list of banners in active tab
  const getActiveTabBanners = () => {
    if (activeTab === 0) return banners.main;
    if (activeTab === 1) return banners.topRight;
    return banners.bottomRight;
  };

  // Helper: Set form field
  const setField = (key: keyof typeof defaultForm, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Switch Tab
  const handleTabChange = (tab: 0 | 1 | 2) => {
    setActiveTab(tab);
    handleCancelEdit(); // reset form when changing tabs
  };

  // Click Edit
  const handleEditClick = (banner: HeroBanner) => {
    setEditingId(banner.id);
    setFormData({
      badge: banner.badge,
      title: banner.title,
      titleSuffix: banner.titleSuffix,
      subtitle: banner.subtitle,
      tagline: banner.tagline,
      description: banner.description,
      ctaText: banner.ctaText,
      ctaColor: banner.ctaColor,
      ctaTextColor: banner.ctaTextColor,
      bgColor: banner.bgColor,
      imageUrl: banner.imageUrl,
      imageAlt: banner.imageAlt,
      linkHref: banner.linkHref,
      align: banner.align,
      isActive: banner.isActive,
    });
    setErrorMsg(null);
  };

  // Cancel Edit / Add New
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setErrorMsg(null);
  };

  // Save Form (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setErrorMsg("Judul utama wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        setErrorMsg(null);
        setSuccessMsg(null);

        const payload = {
          ...formData,
          position: activeTab,
        };

        if (editingId) {
          // Update
          const updated = await saveHeroBanner(editingId, payload);
          // Optimistic update local state
          setBanners((prev) => ({
            main: prev.main.map((b) => b.id === editingId ? { ...b, ...payload } : b),
            topRight: prev.topRight.map((b) => b.id === editingId ? { ...b, ...payload } : b),
            bottomRight: prev.bottomRight.map((b) => b.id === editingId ? { ...b, ...payload } : b),
          }));
          setSuccessMsg("✓ Banner berhasil diperbarui!");
          handleCancelEdit();
        } else {
          // Create — reload untuk dapat ID baru dari server
          await createHeroBanner(payload);
          setSuccessMsg("✓ Banner baru berhasil ditambahkan!");
          handleCancelEdit();
          router.refresh();
          setTimeout(() => { window.location.reload(); }, 800);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal menyimpan data.");
      }
    });
  };

  // Delete Banner
  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;

    // Optimistic update — langsung hapus dari UI sebelum request selesai
    setBanners((prev) => ({
      main: prev.main.filter((b) => b.id !== id),
      topRight: prev.topRight.filter((b) => b.id !== id),
      bottomRight: prev.bottomRight.filter((b) => b.id !== id),
    }));
    if (editingId === id) handleCancelEdit();

    startTransition(async () => {
      try {
        setErrorMsg(null);
        await deleteHeroBanner(id);
        setSuccessMsg("✓ Banner berhasil dihapus!");
        router.refresh();
      } catch (err: any) {
        // Rollback jika gagal
        setErrorMsg(err.message || "Gagal menghapus banner.");
        router.refresh();
        setTimeout(() => { window.location.reload(); }, 500);
      }
    });
  };

  // Toggle Active Status directly
  const handleToggleActive = (banner: HeroBanner) => {
    // Optimistic update — langsung balik status di UI
    const newStatus = !banner.isActive;
    setBanners((prev) => ({
      main: prev.main.map((b) => b.id === banner.id ? { ...b, isActive: newStatus } : b),
      topRight: prev.topRight.map((b) => b.id === banner.id ? { ...b, isActive: newStatus } : b),
      bottomRight: prev.bottomRight.map((b) => b.id === banner.id ? { ...b, isActive: newStatus } : b),
    }));

    startTransition(async () => {
      try {
        setErrorMsg(null);
        await saveHeroBanner(banner.id, { isActive: newStatus });
        router.refresh();
      } catch (err: any) {
        // Rollback jika gagal
        setBanners((prev) => ({
          main: prev.main.map((b) => b.id === banner.id ? { ...b, isActive: banner.isActive } : b),
          topRight: prev.topRight.map((b) => b.id === banner.id ? { ...b, isActive: banner.isActive } : b),
          bottomRight: prev.bottomRight.map((b) => b.id === banner.id ? { ...b, isActive: banner.isActive } : b),
        }));
        setErrorMsg(err.message || "Gagal mengubah status.");
      }
    });
  };

  // Reset to Defaults
  const handleReset = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua banner kustom dan kembali ke default?")) return;

    startTransition(async () => {
      try {
        await resetHero();
        setSuccessMsg("✓ Pengaturan berhasil direset!");
        router.refresh();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal mereset data.");
      }
    });
  };

  const tabBanners = getActiveTabBanners();

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#e1e3e4] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[#003527] font-bold text-2xl">Kelola Hero Banner</h1>
            <p className="text-sm text-[#707974] mt-0.5">Atur banner promosi sliding pada homepage beranda</p>
          </div>
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 border border-[#ba1a1a]/30 hover:bg-[#ffdad6] text-[#ba1a1a] font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset Default
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 bg-white border-b border-[#e1e3e4] flex gap-2">
          <button
            onClick={() => handleTabChange(0)}
            className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 0
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
              }`}
          >
            <span className="material-symbols-outlined text-lg">view_carousel</span>
            <span>Hero Utama ({banners.main.length})</span>
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 1
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
              }`}
          >
            <span className="material-symbols-outlined text-lg">dock_to_right</span>
            <span>Kanan Atas ({banners.topRight.length})</span>
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 2
                ? "border-[#003527] text-[#003527]"
                : "border-transparent text-[#707974] hover:text-[#003527]"
              }`}
          >
            <span className="material-symbols-outlined text-lg">dock_to_bottom</span>
            <span>Kanan Bawah ({banners.bottomRight.length})</span>
          </button>
        </div>

        {/* Notification Toasts */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm animate-pulse">
            <span className="material-symbols-outlined">check_circle</span>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Banner List (7 Cols) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#e1e3e4] bg-[#f8f9fa] flex justify-between items-center">
                <h2 className="font-bold text-sm text-[#003527] uppercase tracking-wide">
                  {activeTab === 0 ? "Daftar Slide Hero Utama" : activeTab === 1 ? "Daftar Slide Kanan Atas" : "Daftar Slide Kanan Bawah"}
                </h2>
                <span className="text-xs bg-[#064e3b]/10 text-[#064e3b] font-bold px-2 py-0.5 rounded-full">
                  {tabBanners.length} Items
                </span>
              </div>

              {tabBanners.length === 0 ? (
                <div className="p-12 text-center text-[#707974]">
                  <span className="material-symbols-outlined text-4xl text-[#bfc9c3] mb-2 block">image</span>
                  <p className="text-sm font-bold">Belum Ada Banner Kustom</p>
                  <p className="text-xs text-[#707974]/80 mt-1 max-w-sm mx-auto">
                    Halaman homepage akan otomatis menggunakan slide template default bawaan sistem.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#e1e3e4]">
                  {tabBanners.map((b) => (
                    <div key={b.id} className="p-4 flex gap-4 items-center justify-between hover:bg-slate-50 transition-colors">
                      {/* Thumbnail Preview */}
                      <div
                        className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-[#e1e3e4] flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: b.bgColor || "#064e3b" }}
                      >
                        {b.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          b.badge || "CARD"
                        )}
                      </div>

                      {/* Content Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#191c1d] truncate">{b.title}</h4>
                          {b.badge && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.2 bg-[#003527]/10 text-[#003527] rounded">
                              {b.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#707974] truncate mt-0.5">
                          {b.linkHref || "Tanpa Link"} • {b.align}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Active Toggle Switch */}
                        <button
                          onClick={() => handleToggleActive(b)}
                          title={b.isActive ? "Nonaktifkan" : "Aktifkan"}
                          className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${b.isActive ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                            }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white shadow" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-2 border border-[#bfc9c3] text-[#707974] hover:bg-[#f3f4f5] rounded-lg transition-colors flex items-center justify-center"
                          title="Edit Card"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 border border-[#ba1a1a]/30 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg transition-colors flex items-center justify-center"
                          title="Hapus Card"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Add/Edit Form + Live Preview (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            {/* Live Interactive Preview Card */}
            <div className="bg-white rounded-xl border border-[#e1e3e4] p-4 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider">Live Preview</p>

              {/* Conditional rendering of correct preview template based on activeTab */}
              {activeTab === 0 ? (
                // PREVIEW HERO UTAMA
                <div
                  className="relative rounded-xl overflow-hidden h-48 shadow-md transition-all duration-300 border border-slate-100/50 flex flex-col justify-between"
                  style={{ backgroundColor: formData.bgColor || "#111827" }}
                >
                  {formData.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      {formData.badge && (
                        <span className="w-fit bg-blue-600/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {formData.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-white">
                      <p className="text-base font-black leading-tight">
                        {formData.title || "Judul Banner"}
                        {formData.titleSuffix && <span className="font-light italic text-sky-300"> {formData.titleSuffix}</span>}
                      </p>
                      <p className="text-[10px] text-white/70 mt-1 line-clamp-2">{formData.description || "Deskripsi..."}</p>
                      {formData.ctaText && (
                        <div className="mt-2">
                          <span className="bg-white text-slate-900 text-[9px] font-bold px-2.5 py-1 rounded shadow-sm">{formData.ctaText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 1 ? (
                // PREVIEW KANAN ATAS
                <div
                  className="relative rounded-xl overflow-hidden h-36 shadow-md transition-all duration-300 border border-slate-100/50 flex flex-col justify-between"
                  style={{ backgroundColor: formData.bgColor || "#111827" }}
                >
                  {formData.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                      {formData.badge ? (
                        <span className="bg-yellow-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                          {formData.badge}
                        </span>
                      ) : <div />}
                      {formData.tagline && (
                        <span className="text-[8px] text-white bg-black/35 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase tracking-wider">
                          {formData.tagline}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black leading-tight">{formData.title || "Judul Kanan Atas"}</h3>
                      {formData.subtitle && <p className="text-[9px] text-white/80 line-clamp-1">{formData.subtitle}</p>}
                    </div>
                    <div className="flex justify-between items-center w-full mt-1">
                      {formData.ctaText ? (
                        <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{formData.ctaText}</span>
                      ) : <div />}
                      <span className="text-[8px] text-white/50">JernihCreatif</span>
                    </div>
                  </div>
                </div>
              ) : (
                // PREVIEW KANAN BAWAH
                <div
                  className="relative rounded-xl overflow-hidden h-36 shadow-md transition-all duration-300 border border-slate-100/50 flex flex-col justify-between"
                  style={{ backgroundColor: formData.bgColor || "#111827" }}
                >
                  {formData.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                      {formData.badge ? (
                        <span className="bg-amber-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded">
                          {formData.badge}
                        </span>
                      ) : <div />}
                      {formData.tagline && (
                        <span className="text-[8px] text-white bg-black/35 px-2 py-0.5 rounded-full border border-white/10">
                          {formData.tagline}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black leading-tight uppercase">{formData.title || "Judul Kanan Bawah"}</h3>
                      {formData.subtitle && <p className="text-[8px] text-white/80 line-clamp-1">{formData.subtitle}</p>}
                    </div>
                    <div className="flex justify-between items-center w-full mt-1">
                      {formData.ctaText ? (
                        <span className="bg-[#e11d48] text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full">{formData.ctaText}</span>
                      ) : <div />}
                      <span className="text-[8px] text-white/50">JernihCreatif</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form Card */}
            <div className="bg-white rounded-xl border border-[#e1e3e4] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#e1e3e4] bg-[#f8f9fa] flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#003527]">
                  {editingId ? "✏️ Edit Banner" : "✨ Tambah Banner Baru"}
                </h3>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-[#707974] hover:text-black font-semibold border-b border-[#707974]"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Judul Utama *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Contoh: Intel Powering Ideas"
                    className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 outline-none transition-all"
                  />
                </div>

                {/* Main Hero specific: Title Suffix & Description */}
                {activeTab === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Suffix Judul (Italic)</label>
                        <input
                          type="text"
                          value={formData.titleSuffix || ""}
                          onChange={(e) => setField("titleSuffix", e.target.value)}
                          placeholder="cth: 5G"
                          className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Badge Card</label>
                        <input
                          type="text"
                          value={formData.badge || ""}
                          onChange={(e) => setField("badge", e.target.value)}
                          placeholder="cth: NEW"
                          className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Deskripsi Singkat</label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => setField("description", e.target.value)}
                        rows={2}
                        placeholder="Deskripsi penawaran atau spesifikasi singkat..."
                        className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Top/Bottom Banners specific: Subtitle, Tagline, Badge */}
                {activeTab !== 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Subtitle</label>
                      <input
                        type="text"
                        value={formData.subtitle || ""}
                        onChange={(e) => setField("subtitle", e.target.value)}
                        placeholder="cth: Muli dari Rp 900rb"
                        className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Tagline</label>
                      <input
                        type="text"
                        value={formData.tagline || ""}
                        onChange={(e) => setField("tagline", e.target.value)}
                        placeholder="cth: FREE SMARTWATCH"
                        className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Badge Card</label>
                      <input
                        type="text"
                        value={formData.badge || ""}
                        onChange={(e) => setField("badge", e.target.value)}
                        placeholder="cth: PROMO"
                        className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                      />
                    </div>
                  </div>
                )}


                {/* CTA Text */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">CTA Text (Tombol)</label>
                  <input
                    type="text"
                    value={formData.ctaText || ""}
                    onChange={(e) => setField("ctaText", e.target.value)}
                    placeholder="cth: Beli Sekarang"
                    className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                  />
                </div>

                {/* Image URL & Alt */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">URL Gambar</label>
                  <input
                    type="text"
                    value={formData.imageUrl || ""}
                    onChange={(e) => setField("imageUrl", e.target.value)}
                    placeholder="https://domain.com/path-to-image.png"
                    className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                  />
                  <div className="mt-1.5 flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5 shrink-0">photo_size_select_large</span>
                    <div className="text-[10px] text-blue-700 leading-relaxed">
                      {activeTab === 0 ? (
                        <>
                          <p className="font-black mb-0.5">📐 Hero Utama — Ukuran Gambar</p>
                          <p>Lebar: <b>840 px</b> · Tinggi: <b>400 px</b> (desktop) / <b>168 px</b> (mobile)</p>
                          <p className="text-blue-500 mt-0.5">Format JPG/PNG/WebP · Rasio ideal 2:1</p>
                        </>
                      ) : activeTab === 1 ? (
                        <>
                          <p className="font-black mb-0.5">📐 Card Kanan Atas — Ukuran Gambar</p>
                          <p>Lebar: <b>420 px</b> · Tinggi: <b>158 px</b> (desktop) / <b>168 px</b> (mobile)</p>
                          <p className="text-blue-500 mt-0.5">Format JPG/PNG/WebP · Rasio ideal 2:1</p>
                        </>
                      ) : (
                        <>
                          <p className="font-black mb-0.5">📐 Card Kanan Bawah — Ukuran Gambar</p>
                          <p>Lebar: <b>420 px</b> · Tinggi: <b>158 px</b> (desktop) / <b>168 px</b> (mobile)</p>
                          <p className="text-blue-500 mt-0.5">Format JPG/PNG/WebP · Rasio ideal 2:1</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Link & Align */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Link Tujuan</label>
                    <input
                      type="text"
                      value={formData.linkHref || ""}
                      onChange={(e) => setField("linkHref", e.target.value)}
                      placeholder="cth: /produk/nama-produk"
                      className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3.5 py-2.5 text-sm focus:border-[#003527] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#707974] uppercase tracking-wider">Perataan Teks (Align)</label>
                    <select
                      value={formData.align || "left"}
                      onChange={(e) => setField("align", e.target.value)}
                      className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-3 py-2.5 text-sm focus:border-[#003527] outline-none"
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full py-3 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${isPending
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-[#003527] text-white hover:bg-[#064e3b]"
                    }`}
                >
                  {isPending ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">sync</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      {editingId ? "Perbarui Banner" : "Tambahkan Banner"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
