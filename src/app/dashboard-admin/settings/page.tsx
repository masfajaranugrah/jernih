"use client";

import { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";

function Toggle({ id, defaultChecked = false }: { id: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        on ? "bg-[#003527]" : "bg-[#bfc9c3]"
      }`}
      id={id}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
          on ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-12 py-10">
          {/* Page header */}
          <div className="mb-10">
            <h2 className="text-[#191c1d] font-semibold" style={{ fontSize: "30px", lineHeight: "1.2" }}>
              Settings
            </h2>
            <p className="text-[#404944] text-base mt-1">Manage your account preferences and security.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
            {/* Left column — forms */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Account Security */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center mb-6 border-b border-[#e1e3e4] pb-4">
                  <span className="material-symbols-outlined text-[#003527] mr-3">security</span>
                  <h3 className="text-[#191c1d] font-semibold text-2xl">Account Security</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#404944] mb-1.5 uppercase tracking-wider" htmlFor="currentPass">
                      Current Password
                    </label>
                    <input
                      id="currentPass"
                      className="w-full bg-[#f8f9fa] border border-[#bfc9c3] rounded px-3 py-3 text-sm focus:outline-none focus:border-[#282f3b] focus:ring-1 focus:ring-[#282f3b] transition-colors"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#404944] mb-1.5 uppercase tracking-wider" htmlFor="newPass">
                        New Password
                      </label>
                      <input
                        id="newPass"
                        className="w-full bg-[#f8f9fa] border border-[#bfc9c3] rounded px-3 py-3 text-sm focus:outline-none focus:border-[#282f3b] focus:ring-1 focus:ring-[#282f3b] transition-colors"
                        placeholder="Create new password"
                        type="password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#404944] mb-1.5 uppercase tracking-wider" htmlFor="confirmPass">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPass"
                        className="w-full bg-[#f8f9fa] border border-[#bfc9c3] rounded px-3 py-3 text-sm focus:outline-none focus:border-[#282f3b] focus:ring-1 focus:ring-[#282f3b] transition-colors"
                        placeholder="Confirm password"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[#e1e3e4]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#191c1d]">Two-Factor Authentication (2FA)</h4>
                        <p className="text-sm text-[#404944] mt-1">Add an extra layer of security to your account.</p>
                      </div>
                      <Toggle id="toggle2fa" defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center mb-6 border-b border-[#e1e3e4] pb-4">
                  <span className="material-symbols-outlined text-[#003527] mr-3">notifications_active</span>
                  <h3 className="text-[#191c1d] font-semibold text-2xl">Notifications</h3>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      id: "toggleEmail",
                      title: "Email Notifications",
                      desc: "Receive order updates and promotions via email.",
                      defaultOn: true,
                    },
                    {
                      id: "togglePush",
                      title: "Push Notifications",
                      desc: "Get real-time alerts on your devices.",
                      defaultOn: true,
                    },
                    {
                      id: "toggleSMS",
                      title: "SMS Alerts",
                      desc: "Important account activity sent to your phone.",
                      defaultOn: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-2 ${i > 0 ? "border-t border-[#e1e3e4] pt-4" : ""}`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-[#191c1d]">{item.title}</h4>
                        <p className="text-sm text-[#404944] mt-1">{item.desc}</p>
                      </div>
                      <Toggle id={item.id} defaultChecked={item.defaultOn} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Privacy */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center mb-6 border-b border-[#e1e3e4] pb-4">
                  <span className="material-symbols-outlined text-[#003527] mr-3">visibility_off</span>
                  <h3 className="text-[#191c1d] font-semibold text-2xl">Privacy Settings</h3>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[#191c1d]">Data Sharing</h4>
                    <p className="text-sm text-[#404944] mt-1">Allow anonymous data usage for product improvements.</p>
                  </div>
                  <Toggle id="toggleData" defaultChecked={false} />
                </div>
              </section>

              {/* Save button */}
              <div className="flex justify-end">
                <button className="bg-[#003527] text-white text-sm font-semibold px-10 py-3 rounded hover:bg-[#064e3b] transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">save</span>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Right column — help */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-8 bg-[#f3f4f5] p-6 rounded-xl border border-[#e1e3e4]">
                <h4 className="text-[#191c1d] font-semibold text-2xl mb-3 flex items-center">
                  <span className="material-symbols-outlined text-[#003527] mr-2 text-xl">help_outline</span>
                  Need Help?
                </h4>
                <p className="text-[#404944] text-sm mb-6">
                  If you&apos;re having trouble updating your settings, our support team is available 24/7.
                </p>
                <button className="w-full border border-[#282f3b] text-[#191c1d] text-sm font-semibold px-6 py-3 rounded hover:bg-[#e1e3e4] transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
