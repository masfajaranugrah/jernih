"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getTokenSlug } from "@/lib/auth";

type Toast = { type: "success" | "error"; message: string } | null;

export default function ProfileContent() {
  const pathname = usePathname();
  const { user, logout, refresh, clearAuthCache, loading } = useAuth();

  // Fallback ke slug dari token (tanpa API) supaya link menu (wishlist, orders,
  // dll.) selalu mengarah ke halaman langsung meski user auth belum selesai load.
  const userSlug =
    user?.slug ??
    user?.name?.toLowerCase().replace(/\s+/g, "-") ??
    getTokenSlug() ??
    "";
  const segments = pathname.split("/");
  const nama = segments[3] || userSlug || "user";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setForm({
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
      });
      setAvatarUrl(user.avatar || "");
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal upload foto");
      }

      const data = await res.json();
      const url = data.urls?.[0];
      if (!url) throw new Error("Gagal mendapatkan URL foto");

      setAvatarUrl(url);
      setToast({ type: "success", message: "Foto berhasil diupload!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal upload foto";
      setToast({ type: "error", message: msg });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setToast(null);
    const name = `${form.firstName} ${form.lastName}`.trim();
    const body: Record<string, string> = { name };
    if (form.phone) body.phone = form.phone;
    if (avatarUrl) body.avatar = avatarUrl;
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyimpan perubahan");
      }

      // Pakai response data agar form tetap terbaru meski auth-cache stale
      const updated = await res.json();
      if (updated.name) {
        const nameParts = updated.name.trim().split(" ");
        setForm({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: updated.email ?? form.email,
          phone: updated.phone ?? form.phone,
        });
        setAvatarUrl(updated.avatar ?? avatarUrl);
      }

      // Re-issue JWT agar name di token ikut terbaru (name dibaca dari token)
      try {
        await fetch("/api/auth/refresh", { method: "POST" });
      } catch {}

      // Bersihkan cache auth agar refresh() ambil data terbaru dari DB
      clearAuthCache();
      await refresh();
      setToast({ type: "success", message: "Profil berhasil diperbarui!" });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout("/dashboard/pelanggan/login");
  }

  const menuItems = [
    { href: `/dashboard/pelanggan/${nama}/orders`, icon: "shopping_bag", label: "Orders / Pesanan" },
    { href: `/dashboard/pelanggan/${nama}/wishlist`, icon: "favorite", label: "Wishlist Saya" },
    { href: `/dashboard/pelanggan/${nama}/vouchers`, icon: "confirmation_number", label: "Vouchers & Promo" },
    { href: `/dashboard/pelanggan/${nama}/chat`, icon: "chat", label: "Chat Bantuan" },
    { href: `/dashboard/pelanggan/${nama}/bantuan`, icon: "support_agent", label: "Pusat Bantuan" },
    { href: `/dashboard/pelanggan/${nama}/addresses`, icon: "location_on", label: "Daftar Alamat" },
  ];

  const fullDisplayName =
    user?.name ||
    `${form.firstName} ${form.lastName}`.trim() ||
    (loading ? "" : "Pengguna");
  const displayEmail = form.email || user?.email || "email@domain.com";
  const displayPhone = form.phone || user?.phone || "-";

  return (
    <>
      {/* Page heading */}
      <div className="mb-6 md:mb-10">
        <h2
          className="text-[#191c1d] font-bold tracking-tight mb-1"
          style={{ fontSize: "clamp(26px, 4vw, 36px)", lineHeight: "1.2", letterSpacing: "-0.02em" }}
        >
          My Profile
        </h2>
        <p className="text-[#707974] text-xs md:text-base">
          Kelola informasi pribadi dan preferensi akun Anda.
        </p>
      </div>

      {/* DESKTOP ONLY: Full Profile Form Card (Unchanged for Desktop) */}
      <div className="hidden md:block bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#e1e3e4] p-10 max-w-3xl">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex items-center gap-6 pb-8 border-b border-[#e1e3e4]">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#bfc9c3] group-hover:border-[#003527] transition-colors duration-300 bg-[#003527] text-white flex items-center justify-center font-bold text-3xl">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullDisplayName.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#191c1d] mb-1">{fullDisplayName}</h3>
              <p className="text-[#707974] text-sm mb-4">{displayEmail}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="px-4 py-2 bg-[#f3f4f5] hover:bg-[#edeeef] border border-[#bfc9c3] rounded-lg font-semibold text-sm text-[#191c1d] transition-colors cursor-pointer disabled:opacity-50"
              >
                {avatarUploading ? "Mengupload..." : "Ubah Foto"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="desk-firstName" className="block font-semibold text-sm text-[#191c1d]">
                Nama Depan
              </label>
              <input
                id="desk-firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desk-lastName" className="block font-semibold text-sm text-[#191c1d]">
                Nama Belakang
              </label>
              <input
                id="desk-lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label htmlFor="desk-email" className="block font-semibold text-sm text-[#191c1d]">
                Alamat Email
              </label>
              <input
                id="desk-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label htmlFor="desk-phone" className="block font-semibold text-sm text-[#191c1d]">
                Nomor Telepon / WhatsApp
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#bfc9c3] bg-[#f3f4f5] text-[#707974] text-sm font-medium">
                  +62
                </span>
                <input
                  id="desk-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="812 3456 7890"
                  className="flex-1 px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-r-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e1e3e4] flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-[#bfc9c3] hover:bg-[#f3f4f5] text-[#191c1d] font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* MOBILE ONLY: Compact Profile Summary Card + Pencil Icon */}
      <div className="block md:hidden space-y-6 max-w-3xl">
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e1e3e4] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99] transition-transform"
        >
          {/* Avatar & User Details */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 shrink-0 rounded-full bg-[#003527] text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullDisplayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-[#191c1d] truncate leading-tight mb-0.5">
                {fullDisplayName}
              </h3>
              <p className="text-xs text-[#707974] truncate mb-0.5">{displayEmail}</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#003527]">
                <span className="material-symbols-outlined text-[14px]">call</span>
                <span>{displayPhone.startsWith("+62") ? displayPhone : `+62 ${displayPhone}`}</span>
              </div>
            </div>
          </div>

          {/* Pencil Edit Icon Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            aria-label="Edit Profile"
            className="w-10 h-10 shrink-0 rounded-full bg-[#f3f4f5] hover:bg-[#003527] text-[#003527] hover:text-white border border-[#bfc9c3] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>

        {/* MOBILE MENU ITEMS & LOGOUT */}
        <div className="space-y-4 pb-24">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#707974] px-1">
            Menu Dashboard Pelanggan
          </h3>

          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#e1e3e4] overflow-hidden divide-y divide-[#e1e3e4]">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-5 py-4 text-[#191c1d] active:bg-[#f8f9fa] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="material-symbols-outlined text-[#003527] text-xl">
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-[#707974] text-lg">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-200/80 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* MOBILE PROFILE EDIT MODAL */}
      {isModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Dialog Window */}
          <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003527]">edit_square</span>
                <h3 className="font-bold text-lg text-[#191c1d]">Edit Profil Saya</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Photo Area */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#e1e3e4]">
                <div className="w-16 h-16 rounded-full bg-[#003527] text-white flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    fullDisplayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#191c1d]">{fullDisplayName}</h4>
                  <p className="text-xs text-[#707974] mb-2">{displayEmail}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-3 py-1.5 bg-[#f3f4f5] hover:bg-[#edeeef] border border-[#bfc9c3] rounded-md font-semibold text-xs text-[#191c1d] cursor-pointer disabled:opacity-50"
                  >
                    {avatarUploading ? "Mengupload..." : "Ubah Foto"}
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="mob-firstName" className="block font-semibold text-xs text-[#191c1d]">
                    Nama Depan
                  </label>
                  <input
                    id="mob-firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mob-lastName" className="block font-semibold text-xs text-[#191c1d]">
                    Nama Belakang
                  </label>
                  <input
                    id="mob-lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mob-email" className="block font-semibold text-xs text-[#191c1d]">
                    Alamat Email
                  </label>
                  <input
                    id="mob-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mob-phone" className="block font-semibold text-xs text-[#191c1d]">
                    Nomor Telepon / WhatsApp
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#bfc9c3] bg-[#f3f4f5] text-[#707974] text-xs font-medium">
                      +62
                    </span>
                    <input
                      id="mob-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="812 3456 7890"
                      className="flex-1 px-3.5 py-2.5 bg-[#f8f9fa] border border-[#bfc9c3] rounded-r-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none text-sm text-[#191c1d]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-[#e1e3e4] bg-[#f8f9fa] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-[#bfc9c3] hover:bg-white text-[#191c1d] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom fade-in duration-300">
          <div
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
              toast.type === "success"
                ? "bg-[#003527] text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
