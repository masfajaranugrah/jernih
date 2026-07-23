"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function ProfilePage() {
 const [toast, setToast] = useState(false);
 const [saving, setSaving] = useState(false);
 const fileRef = useRef<HTMLInputElement>(null);
 const [avatar, setAvatar] = useState(
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBMS7tJz7tJJAii1UvQa4yOjFbbDrydQ7QivU5CLSrGvcKWNIsVlBVFtuMsDMkBdxyTUpJE0DaI_Ho00IxFypXQEJgOMCtSyqoEd3qAd5Pn_T3VB8_CTmggRgC1vJeqUXyPUWkGfMJtxZaULaV7xP_DCZMQgmjuSIMJ2fuZDk_kjfb4GiaPQZOfi1YLigTQa2LDgTzKk8bBjp6RWAmLu4JW0fRrZNVxWGYJSJLXOf7aQb3-HMOCSydB"
 );

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) setAvatar(URL.createObjectURL(file));
 };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setTimeout(() => {
   setSaving(false);
   setToast(true);
   setTimeout(() => setToast(false), 3000);
  }, 1500);
 };

 return (
  <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; display:inline-block; line-height:1; }
    .glass-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
    .glass-card:hover { transform: translateY(-4px); }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
   `}</style>


   <main className="lg:ml-64 p-6 md:p-12 pb-24 lg:pb-12 max-w-4xl mx-auto w-full lg:max-w-none">
    {/* Page header */}
    <header className="mb-12">
     <h1 className="text-[#003527] font-semibold tracking-tight" style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: "1.1" }}>
      Profil Saya
     </h1>
     <p className="text-[#404944] text-base mt-1">
      Perbarui informasi personal Anda untuk pengalaman belanja yang lebih personal.
     </p>
    </header>

    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
     {/* Avatar card */}
     <div className="md:col-span-4 glass-card p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center gap-6">
      <div
       className="relative group cursor-pointer"
       onClick={() => fileRef.current?.click()}
      >
       <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#b0f0d6] bg-[#edeeef] shadow-inner relative">
        <Image src={avatar} alt="Foto profil" fill className="object-cover" />
       </div>
       <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
       </div>
       <input
        ref={fileRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={handleFileChange}
       />
      </div>
      <div className="text-center">
       <h3 className="text-sm font-semibold text-[#191c1d]">Foto Profil</h3>
       <p className="text-xs text-[#404944] mt-1">JPG, PNG atau WebP. Maks 2MB.</p>
       <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mt-4 text-[#003527] text-sm font-semibold border-b-2 border-[#b0f0d6] hover:border-[#003527] transition-all"
       >
        Ganti Foto
       </button>
      </div>
     </div>

     {/* Personal info card */}
     <div className="md:col-span-8 glass-card p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] space-y-5">
      {/* Full name */}
      <div className="flex flex-col gap-1.5">
       <label className="text-xs font-semibold text-[#404944] tracking-wide" htmlFor="fullName">Nama Lengkap</label>
       <input
        className="w-full p-4 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg text-sm text-[#191c1d] focus:border-[#003527] transition-all outline-none"
        id="fullName"
        defaultValue="Adrian Wijaya"
        placeholder="Masukkan nama lengkap Anda"
        type="text"
       />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#404944] tracking-wide" htmlFor="email">Email</label>
        <div className="relative">
         <input
          className="w-full p-4 pr-12 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg text-sm text-[#191c1d] focus:border-[#003527] transition-all outline-none"
          id="email"
          defaultValue="adrian.wijaya@example.com"
          placeholder="nama@email.com"
          type="email"
         />
         <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#404944]/50 text-lg">mail</span>
        </div>
       </div>
       <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#404944] tracking-wide" htmlFor="phone">Nomor Telepon</label>
        <div className="relative">
         <input
          className="w-full p-4 pr-12 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg text-sm text-[#191c1d] focus:border-[#003527] transition-all outline-none"
          id="phone"
          defaultValue="+62 812 3456 7890"
          placeholder="+62"
          type="tel"
         />
         <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#404944]/50 text-lg">call</span>
        </div>
       </div>
      </div>

      {/* DOB */}
      <div className="flex flex-col gap-1.5">
       <label className="text-xs font-semibold text-[#404944] tracking-wide" htmlFor="dob">Tanggal Lahir</label>
       <div className="relative">
        <input
         className="w-full p-4 pr-12 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg text-sm text-[#191c1d] focus:border-[#003527] transition-all outline-none"
         id="dob"
         defaultValue="1992-08-15"
         type="date"
        />
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#404944]/50 text-lg pointer-events-none">calendar_today</span>
       </div>
      </div>

      {/* Actions */}
      <div className="pt-5 border-t border-[#e1e3e4]/50 flex justify-end gap-4">
       <button
        type="button"
        className="px-8 py-3 border border-[#bfc9c3] text-[#191c1d] text-sm font-semibold rounded-full hover:bg-[#edeeef] transition-all active:scale-95"
       >
        Batalkan
       </button>
       <button
        type="submit"
        disabled={saving}
        className="px-10 py-3 bg-[#003527] text-white text-sm font-semibold rounded-full shadow-lg hover:bg-[#064e3b] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-80 disabled:pointer-events-none"
       >
        <span className={`material-symbols-outlined text-lg ${saving ? "animate-spin" : ""}`}>
         {saving ? "autorenew" : "save"}
        </span>
        Simpan Perubahan
       </button>
      </div>
     </div>

     {/* Account status card */}
     <div className="md:col-span-12 glass-card p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-6">
      <div className="flex items-center gap-4">
       <div className="w-12 h-12 bg-[#b0f0d6] rounded-full flex items-center justify-center text-[#002117]">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
       </div>
       <div>
        <p className="text-sm font-semibold text-[#191c1d]">Status Akun</p>
        <p className="text-xs text-[#404944]">Terverifikasi sejak Januari 2023</p>
       </div>
      </div>
      <div className="flex items-center gap-3">
       <span className="px-4 py-1 bg-[#dce2f7] text-[#141b2b] text-xs font-semibold rounded-full">Member Gold</span>
       <button type="button" className="text-[#003527] text-sm font-semibold hover:underline">Lihat Benefit</button>
      </div>
     </div>
    </form>
   </main>

   {/* Toast */}
   <div
    className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${
     toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    }`}
   >
    <div className="bg-[#003527] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
     <span className="material-symbols-outlined">check_circle</span>
     <span className="text-sm font-semibold">Profil Anda berhasil diperbarui!</span>
    </div>
   </div>
  </div>
 );
}
