"use client";

import { useState } from "react";

const initialAddresses = [
 {
  id: 1,
  label: "Home",
  icon: "home",
  iconBg: "bg-[#b0f0d6]",
  iconText: "text-[#002117]",
  labelColor: "text-[#003527]",
  name: "Jane Cooper",
  address: "4517 Washington Ave. Manchester, Kentucky 39495, United States",
  phone: "(603) 555-0123",
  isDefault: true,
 },
 {
  id: 2,
  label: "Office",
  icon: "work",
  iconBg: "bg-[#dce2f7]",
  iconText: "text-[#141b2b]",
  labelColor: "text-[#575e70]",
  name: "Jane Cooper (Corporate)",
  address: "2972 Westheimer Rd. Santa Ana, Illinois 85486, United States",
  phone: "(209) 555-0104",
  isDefault: false,
 },
];

export default function AddressesPage() {
 const [addresses, setAddresses] = useState(initialAddresses);
 const [showModal, setShowModal] = useState(false);

 const deleteAddress = (id: number) => {
  setAddresses((prev) => prev.filter((a) => a.id !== id));
 };

 return (
  <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
   `}</style>


   <main className="lg:ml-64 p-6 md:p-12 pb-28 lg:pb-12">
    <div className="max-w-4xl mx-auto">
     {/* Page header */}
     <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
      <div>
       <h1 className="text-[#003527] font-semibold tracking-tight mb-1" style={{ fontSize: "clamp(28px,5vw,48px)", lineHeight: "1.1" }}>
        Addresses
       </h1>
       <p className="text-[#404944] text-base">Manage your delivery locations for a faster checkout experience.</p>
      </div>
      <button
       onClick={() => setShowModal(true)}
       className="flex items-center justify-center gap-2 px-6 py-3 bg-[#003527] text-white rounded-full text-sm font-semibold hover:bg-[#064e3b] transition-all active:scale-95 shadow-sm self-start md:self-auto"
      >
       <span className="material-symbols-outlined text-lg">add</span>
       Add New Address
      </button>
     </header>

     {/* Address grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {addresses.map((addr) => (
       <div
        key={addr.id}
        className={`bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border ${
         addr.isDefault ? "border-[#95d3ba]" : "border-transparent hover:border-[#bfc9c3]"
        } transition-all group relative`}
       >
        {addr.isDefault && (
         <div className="absolute top-5 right-5">
          <span className="bg-[#b0f0d6] text-[#002117] text-[11px] font-bold px-2 py-0.5 rounded-full">Default</span>
         </div>
        )}
        <div className="flex items-start gap-3 mb-5">
         <div className={`p-2.5 ${addr.iconBg} rounded-lg ${addr.iconText}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{addr.icon}</span>
         </div>
         <div>
          <h3 className={`text-sm font-bold ${addr.labelColor}`}>{addr.label}</h3>
          <p className="text-sm font-bold text-[#191c1d] mt-0.5">{addr.name}</p>
         </div>
        </div>
        <div className="space-y-1 mb-6">
         <p className="text-sm text-[#404944] leading-relaxed">{addr.address}</p>
         <p className="text-sm text-[#191c1d] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">call</span>
          {addr.phone}
         </p>
        </div>
        <div className="flex items-center gap-2 border-t border-[#edeeef] pt-4">
         <button className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-[#003527] hover:bg-[#b0f0d6] transition-colors rounded-lg">
          <span className="material-symbols-outlined text-lg">edit</span> Edit
         </button>
         <button
          onClick={() => deleteAddress(addr.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors rounded-lg"
         >
          <span className="material-symbols-outlined text-lg">delete</span> Delete
         </button>
        </div>
       </div>
      ))}

      {/* Add new card */}
      <button
       onClick={() => setShowModal(true)}
       className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[#bfc9c3] hover:border-[#003527] hover:bg-[#edeeef] transition-all group min-h-[220px]"
      >
       <div className="w-12 h-12 bg-[#edeeef] rounded-full flex items-center justify-center group-hover:bg-[#b0f0d6] transition-colors mb-2">
        <span className="material-symbols-outlined text-[#404944] group-hover:text-[#003527]">add</span>
       </div>
       <span className="text-sm font-semibold text-[#404944] group-hover:text-[#003527]">Add New Address</span>
      </button>
     </div>


    </div>
   </main>

   {/* Modal */}
   {showModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
     <div className="absolute inset-0 bg-[#003527]/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
     <div className="bg-white w-full max-w-lg mx-6 rounded-xl shadow-xl overflow-hidden relative z-10 animate-in">
      <div className="p-6 border-b border-[#e1e3e4] flex items-center justify-between">
       <h3 className="text-[#003527] font-semibold text-2xl">New Address</h3>
       <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#e7e8e9] rounded-full transition-colors">
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
       <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
         <label className="block text-xs font-semibold text-[#404944] mb-1.5">Label (e.g. Home, Office)</label>
         <input className="w-full border border-[#bfc9c3] rounded-lg px-3 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all" placeholder="Home" type="text" />
        </div>
        <div>
         <label className="block text-xs font-semibold text-[#404944] mb-1.5">Recipient Name</label>
         <input className="w-full border border-[#bfc9c3] rounded-lg px-3 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all" placeholder="Jane Cooper" type="text" />
        </div>
        <div>
         <label className="block text-xs font-semibold text-[#404944] mb-1.5">Phone Number</label>
         <input className="w-full border border-[#bfc9c3] rounded-lg px-3 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all" placeholder="(603) 555-0123" type="tel" />
        </div>
        <div className="col-span-2">
         <label className="block text-xs font-semibold text-[#404944] mb-1.5">Street Address</label>
         <textarea className="w-full border border-[#bfc9c3] rounded-lg px-3 py-2.5 text-sm focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none" placeholder="Enter your full address..." rows={3} />
        </div>
       </div>
       <div className="flex items-center gap-2">
        <input className="w-4 h-4 text-[#003527] border-[#bfc9c3] rounded accent-[#003527]" id="default-addr" type="checkbox" />
        <label className="text-sm font-semibold text-[#404944]" htmlFor="default-addr">Set as default address</label>
       </div>
       <div className="flex gap-3 pt-2">
        <button
         type="button"
         onClick={() => setShowModal(false)}
         className="flex-1 py-3 border border-[#707974] rounded-full text-sm font-semibold text-[#191c1d] hover:bg-[#e7e8e9] transition-colors"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="flex-1 py-3 bg-[#003527] text-white rounded-full text-sm font-semibold hover:bg-[#064e3b] transition-all active:scale-95 shadow-sm"
        >
         Save Address
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}
