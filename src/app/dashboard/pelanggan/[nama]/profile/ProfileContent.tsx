"use client";

import { useState } from "react";

export default function ProfileContent() {
  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "812 3456 7890",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      {/* Page heading */}
      <div className="mb-10">
        <h2
          className="text-[#191c1d] font-semibold tracking-tight mb-1"
          style={{ fontSize: "36px", lineHeight: "1.2", letterSpacing: "-0.02em" }}
        >
          My Profile
        </h2>
        <p className="text-[#707974] text-base">
          Manage your personal information and preferences.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-6 md:p-10 max-w-3xl">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

          {/* Profile picture */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-[#e1e3e4]">
            <div className="relative group cursor-pointer flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#bfc9c3] group-hover:border-[#003527] transition-colors duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPUazxYF2qrh3UZyIivbfn1wBHlyB5zm-Vj5Tjbw2dqulXjm_sMqczBIl6H0STPO3rmrbmwvBQBaJfw9Po4FdnCiDYeM1xF3XWL2Tr0MsWl4AVPAe_U7mijPnh931DqSot4qR9VDlgKTB15VdLJGrOCJoc2HA1hue-rDl60vwqpYoeowupLCcr7uAThjx3bjXI2ljRy1KT-b2lrk5r7nomSNczXKjVYdfMtEY96wxcuHdkntsEB_9M"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#191c1d] mb-1">Profile Photo</h3>
              <p className="text-[#707974] text-sm mb-4">
                Recommended size 256x256px. JPG, GIF or PNG. 1MB max.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#f3f4f5] hover:bg-[#edeeef] border border-[#bfc9c3] rounded-lg font-semibold text-sm text-[#191c1d] transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg font-semibold text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Personal info fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block font-semibold text-sm text-[#191c1d]">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none transition-all text-sm text-[#191c1d] placeholder:text-[#707974]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block font-semibold text-sm text-[#191c1d]">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none transition-all text-sm text-[#191c1d] placeholder:text-[#707974]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="email" className="block font-semibold text-sm text-[#191c1d]">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none transition-all text-sm text-[#191c1d] placeholder:text-[#707974]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="phone" className="block font-semibold text-sm text-[#191c1d]">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#bfc9c3] bg-[#f3f4f5] text-[#707974] text-sm font-medium select-none">
                  +62
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="812 3456 7890"
                  className="flex-1 px-4 py-3 bg-[#f8f9fa] border border-[#bfc9c3] rounded-r-lg focus:ring-2 focus:ring-[#003527]/20 focus:border-[#003527] outline-none transition-all text-sm text-[#191c1d] placeholder:text-[#707974]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-[#e1e3e4] flex justify-end gap-3">
            <button
              type="button"
              className="px-6 py-3 border border-[#bfc9c3] hover:bg-[#f3f4f5] text-[#191c1d] font-semibold text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
