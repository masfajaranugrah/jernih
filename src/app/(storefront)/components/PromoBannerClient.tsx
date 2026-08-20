"use client";

import { useEffect, useState } from "react";

export default function PromoBannerClient({ endDate }: { endDate: string }) {
  const [left, setLeft] = useState(() => new Date(endDate).getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(new Date(endDate).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const diff = Math.max(0, left);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const Box = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="min-w-9 rounded-lg bg-black/30 px-2 py-1 text-center text-base font-black tabular-nums text-white sm:text-lg">
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5" title="Sisa waktu promo">
      {d > 0 && <Box value={pad(d)} label="Hari" />}
      <Box value={pad(h)} label="Jam" />
      <Box value={pad(m)} label="Menit" />
      <Box value={pad(s)} label="Detik" />
    </div>
  );
}