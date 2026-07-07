"use client";

import { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";

const tickets = [
  {
    id: "#TCK-8924",
    title: "Damaged Item on Arrival",
    desc: "The ceramic vase I ordered arrived with a significant crack along the base. I have photos...",
    date: "Oct 24, 2023",
    status: "Open",
    statusColor: "bg-[#d9dff5] text-[#5c6274]",
    dotColor: "bg-[#575e70]",
    resolved: false,
  },
  {
    id: "#TCK-8810",
    title: "Shipping Delay - Order #10029",
    desc: "My order was supposed to be delivered 3 days ago, but the tracking hasn't updated.",
    date: "Oct 20, 2023",
    status: "In Progress",
    statusColor: "bg-[#3e4552]/20 text-[#abb2c2]",
    dotColor: "bg-[#282f3b]",
    resolved: false,
  },
  {
    id: "#TCK-8501",
    title: "Incorrect Color Sent",
    desc: "I received the black version instead of the emerald green one I selected at checkout.",
    date: "Oct 12, 2023",
    status: "Resolved",
    statusColor: "bg-[#e1e3e4] text-[#404944]",
    dotColor: "bg-[#707974]",
    resolved: true,
  },
];

const tabs = ["All Tickets", "Open", "Resolved"];

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = tickets.filter((t) => {
    if (activeTab === 1) return !t.resolved && t.status === "Open";
    if (activeTab === 2) return t.resolved;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Header */}
        <header className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.04)] px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
          <div>
            <h2 className="text-[#191c1d] font-semibold" style={{ fontSize: "30px", lineHeight: "1.2" }}>
              Complaints
            </h2>
            <p className="text-[#404944] text-base mt-1">Manage and track your support tickets.</p>
          </div>
          <button className="bg-[#003527] text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#064e3b] transition-colors flex items-center gap-2 shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            Create New Ticket
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 max-w-[1280px] mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-[#e1e3e4] pb-0">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`text-sm font-semibold px-4 pb-3 border-b-2 -mb-px transition-colors ${
                  activeTab === i
                    ? "text-[#003527] border-[#003527]"
                    : "text-[#404944] border-transparent hover:text-[#003527]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-[#e1e3e4] mb-4" style={{ fontSize: "48px" }}>inventory_2</span>
                <h3 className="text-[#191c1d] font-semibold text-2xl">No complaints found</h3>
                <p className="text-[#404944] text-base mt-2 max-w-md">
                  You currently have no tickets in this category.
                </p>
              </div>
            )}

            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-5 border border-transparent hover:border-[#e1e3e4] transition-all cursor-pointer group ${
                  ticket.resolved ? "opacity-75 hover:opacity-100" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-[#404944] bg-[#edeeef] px-2 py-1 rounded">
                      {ticket.id}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${ticket.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ticket.dotColor}`} />
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className={`text-[#191c1d] font-semibold text-lg group-hover:text-[#003527] transition-colors ${ticket.resolved ? "line-through decoration-[#bfc9c3]" : ""}`}>
                    {ticket.title}
                  </h3>
                  <p className="text-[#404944] text-sm mt-1 line-clamp-1">{ticket.desc}</p>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                  <p className="text-sm text-[#404944]">{ticket.date}</p>
                  <span className="material-symbols-outlined text-[#404944] group-hover:text-[#003527] transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
