"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/imageCompress";

/**
 * Composer khusus thread tiket bantuan: teks + gambar saja.
 * Transport diinjeksi via props (pelanggan lewat proxy, admin langsung Bearer).
 */
export default function TicketComposer({
  onUpload,
  onSend,
  disabled = false,
  disabledText = "Tiket sudah ditutup",
}: {
  onUpload: (file: File) => Promise<string>;
  onSend: (payload: { message: string; imageUrl?: string }) => Promise<void>;
  disabled?: boolean;
  disabledText?: string;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearImage = () => {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Hanya gambar yang didukung");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const compressed = await compressImage(file);
    clearImage();
    setImage({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
  };

  const send = async () => {
    const message = text.trim();
    if ((!message && !image) || sending || disabled) return;

    setSending(true);
    setError(null);
    try {
      const payload: { message: string; imageUrl?: string } = { message };
      if (image) payload.imageUrl = await onUpload(image.file);
      await onSend(payload);
      setText("");
      clearImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  if (disabled) {
    return (
      <div className="border-t border-gray-200 bg-white p-4">
        <p className="flex items-center justify-center gap-2 rounded-full bg-gray-100 py-2.5 text-sm text-gray-500">
          <span className="material-symbols-outlined text-lg">lock</span>
          {disabledText}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {image && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.previewUrl}
            alt="Preview"
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">{image.file.name}</p>
            <p className="text-xs text-gray-400">
              {(image.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200"
            aria-label="Hapus gambar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          aria-label="Lampirkan gambar"
        >
          <span className="material-symbols-outlined">image</span>
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Tulis pesan..."
          className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-all duration-200 focus:border-[#003527] focus:bg-white focus:shadow-sm"
        />

        <button
          type="button"
          onClick={send}
          disabled={sending || (!text.trim() && !image)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003527] text-white transition-all duration-200 hover:bg-[#004d38] hover:shadow-md disabled:opacity-40"
          aria-label="Kirim"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span className="material-symbols-outlined text-xl">send</span>
          )}
        </button>
      </div>
    </div>
  );
}
