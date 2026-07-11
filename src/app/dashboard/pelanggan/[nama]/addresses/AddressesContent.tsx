"use client";

import { useState } from "react";

type Address = {
  id: number;
  label: string;
  name: string;
  phone: string;
  detail: string;
  isPrimary: boolean;
};

const initialAddresses: Address[] = [
  {
    id: 1,
    label: "Rumah",
    name: "Budi Santoso",
    phone: "+62 812-3456-7890",
    detail:
      "Jl. Jendral Sudirman No. 45, Komplek Permata Hijau Blok C2\nKebayoran Lama, Jakarta Selatan\nDKI Jakarta, 12210",
    isPrimary: true,
  },
  {
    id: 2,
    label: "Kantor",
    name: "Budi Santoso",
    phone: "+62 812-3456-7890",
    detail:
      "Gedung Cyber 2 Tower, Lantai 15 Unit B\nJl. H. R. Rasuna Said Blok X-5\nKuningan, Jakarta Selatan\nDKI Jakarta, 12950",
    isPrimary: false,
  },
  {
    id: 3,
    label: "Orang Tua",
    name: "Siti Aminah",
    phone: "+62 856-7890-1234",
    detail:
      "Jl. Merdeka Barat No. 10, RT 02 / RW 05\nKelurahan Sumur Bandung, Kecamatan Bandung Wetan\nKota Bandung, Jawa Barat, 40111",
    isPrimary: false,
  },
];

export default function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  const setPrimary = (id: number) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === id }))
    );
  };

  const deleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-[#191c1d] font-semibold text-[30px] leading-tight tracking-tight mb-1">
            Buku Alamat
          </h2>
          <p className="text-[#707974] text-base">
            Kelola alamat pengiriman Anda untuk pengalaman checkout yang lebih cepat.
          </p>
        </div>
        <button className="bg-[#003527] text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-[#064e3b] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Alamat Baru
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-white rounded-xl p-6 border shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group transition-colors ${
              address.isPrimary
                ? "border-[#bfc9c3]"
                : "border-[#e1e3e4] hover:border-[#003527]/30"
            }`}
          >
            {/* Primary left accent bar */}
            {address.isPrimary && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[#003527] rounded-l-xl" />
            )}

            {/* Top row: badges + actions */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#d9dff5] text-[#5c6274] font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {address.label}
                </span>
                {address.isPrimary && (
                  <span className="bg-[#003527] text-white font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    Utama
                  </span>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-[#707974] hover:text-[#003527] p-1.5 rounded-lg hover:bg-[#f3f4f5] transition-colors"
                  aria-label="Edit alamat"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                {!address.isPrimary && (
                  <button
                    className="text-[#707974] hover:text-[#ba1a1a] p-1.5 rounded-lg hover:bg-[#ffdad6] transition-colors"
                    aria-label="Hapus alamat"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Address info */}
            <h3 className="text-[#191c1d] font-semibold text-xl mb-1">{address.name}</h3>
            <p className="text-[#707974] text-sm mb-4">{address.phone}</p>
            <p className="text-[#404944] text-sm leading-relaxed mb-5 whitespace-pre-line">
              {address.detail}
            </p>

            {/* Set as primary */}
            {!address.isPrimary && (
              <button
                className="text-[#003527] font-semibold text-sm hover:underline decoration-2 underline-offset-4 transition-all"
                onClick={() => setPrimary(address.id)}
              >
                Jadikan Utama
              </button>
            )}
          </div>
        ))}

        {/* Add new address card */}
        <button className="bg-white rounded-xl p-6 border border-dashed border-[#bfc9c3] hover:border-[#003527] hover:bg-[#f3f4f5] transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group">
          <div className="w-12 h-12 rounded-full bg-[#edeeef] group-hover:bg-[#003527]/10 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[#707974] group-hover:text-[#003527] transition-colors">
              add_location_alt
            </span>
          </div>
          <span className="text-[#707974] group-hover:text-[#003527] font-semibold text-sm transition-colors">
            Tambah Alamat Baru
          </span>
        </button>
      </div>
    </>
  );
}
