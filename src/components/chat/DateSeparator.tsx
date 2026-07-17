"use client";

export function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (today.getTime() - target.getTime()) / 86400000;

  if (diff === 0) return "Hari Ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  }
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function isNewDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() !== db.getFullYear() ||
    da.getMonth() !== db.getMonth() ||
    da.getDate() !== db.getDate()
  );
}

export default function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
        {formatDateLabel(date)}
      </span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}
