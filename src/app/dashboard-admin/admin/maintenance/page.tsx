"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/admin-api";

export default function MaintenanceSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    adminApi<{ enabled?: boolean }>("settings/maintenance_mode")
      .then((data) => {
        setEnabled(data?.enabled === true);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat status maintenance");
        setLoading(false);
      });
  }, []);

  async function handleToggle() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminApi("settings/maintenance_mode", {
        method: "PUT",
        body: JSON.stringify({ enabled: !enabled }),
      });
      setEnabled(!enabled);
      setSuccess(enabled ? "Mode maintenance dimatikan" : "Mode maintenance diaktifkan");
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-[#191c1d]">Mode Maintenance</h1>
      <p className="mt-1 text-sm text-[#707974]">
        Aktifkan mode maintenance untuk menampilkan halaman pemeliharaan ke pengunjung (kecuali admin).
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 px-4 py-3 text-sm text-[#ba1a1a] font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-[#b0f0d6] border border-[#064e3b]/20 px-4 py-3 text-sm text-[#003527] font-medium">
          {success}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
        <div className="flex-1">
          <h2 className="font-bold text-[#191c1d]">Status Saat Ini</h2>
          <p className="mt-1 text-sm text-[#707974]">
            {enabled ? "Situs sedang dalam mode maintenance" : "Situs berjalan normal"}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-colors ${
            enabled
              ? "bg-[#064e3b] text-white hover:bg-[#043b2d]"
              : "bg-[#ba1a1a] text-white hover:bg-[#a31818]"
          } disabled:opacity-60`}
        >
          {saving ? "Menyimpan..." : enabled ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}
