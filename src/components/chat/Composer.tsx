"use client";

import { useRef, useState } from "react";
import { compressImage, validateVideo } from "@/lib/imageCompress";
import ProductCard from "./ProductCard";
import ProductPicker from "./ProductPicker";
import type { ChatProduct, SendPayload } from "./types";

type Attachment = {
  file: File;
  kind: "image" | "video";
  previewUrl: string; // objectURL untuk preview
};

/**
 * Composer chat bersama (pelanggan & admin).
 * Transport diinjeksi via props:
 * - onUpload: upload file → return URL
 * - onSend: kirim payload pesan ke backend
 * - onTyping: emit indikator mengetik (opsional)
 * - enableProductPicker: tampilkan tombol pilih produk (khusus admin)
 */
export default function Composer({
  receiverId,
  product,
  onRemoveProduct,
  onUpload,
  onSend,
  onTyping,
  enableProductPicker = false,
}: {
  receiverId: string;
  product?: ChatProduct | null;
  onRemoveProduct?: () => void;
  onUpload: (file: File) => Promise<string>;
  onSend: (payload: SendPayload) => Promise<void>;
  onTyping?: () => void;
  enableProductPicker?: boolean;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedProduct, setPickedProduct] = useState<ChatProduct | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Produk aktif: dari prop (pelanggan, tombol Tanya Produk) atau picker (admin)
  const activeProduct = product ?? pickedProduct;
  const removeActiveProduct = () => {
    setPickedProduct(null);
    onRemoveProduct?.();
  };

  const clearAttachment = () => {
    if (attachment) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.type.startsWith("video/")) {
      const err = validateVideo(file);
      if (err) {
        setError(err);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      clearAttachment();
      setAttachment({ file, kind: "video", previewUrl: URL.createObjectURL(file) });
    } else if (file.type.startsWith("image/")) {
      // Auto-compress gambar sebelum upload — hemat storage
      const compressed = await compressImage(file);
      clearAttachment();
      setAttachment({
        file: compressed,
        kind: "image",
        previewUrl: URL.createObjectURL(compressed),
      });
    } else {
      setError("Hanya gambar atau video yang didukung");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const send = async () => {
    const message = text.trim();
    if (!message && !attachment && !activeProduct) return;
    if (sending) return;

    setSending(true);
    setError(null);
    try {
      const payload: SendPayload = { receiverId, message };

      if (attachment) {
        const url = await onUpload(attachment.file);
        if (attachment.kind === "image") payload.imageUrl = url;
        else payload.videoUrl = url;
      }
      if (activeProduct) payload.productId = activeProduct.id;

      await onSend(payload);
      setText("");
      clearAttachment();
      removeActiveProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Preview card produk (dari tombol Tanya Produk / picker admin) */}
      {activeProduct && (
        <div className="mb-3">
          <ProductCard product={activeProduct} compact onRemove={removeActiveProduct} />
        </div>
      )}

      {/* Preview lampiran */}
      {attachment && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2">
          {attachment.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.previewUrl}
              alt="Preview"
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200">
              <span className="material-symbols-outlined text-gray-500">videocam</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">
              {attachment.file.name}
            </p>
            <p className="text-xs text-gray-400">
              {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={clearAttachment}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200"
            aria-label="Hapus lampiran"
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
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          aria-label="Lampirkan file"
        >
          <span className="material-symbols-outlined">attach_file</span>
        </button>

        {enableProductPicker && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
            aria-label="Kirim produk"
            title="Kirim produk"
          >
            <span className="material-symbols-outlined">sell</span>
          </button>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping?.();
          }}
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
          disabled={sending || (!text.trim() && !attachment && !activeProduct)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003527] text-white transition-all duration-200 hover:bg-[#004d38] hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:scale-100"
          aria-label="Kirim"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span className="material-symbols-outlined text-xl">send</span>
          )}
        </button>
      </div>

      {enableProductPicker && (
        <ProductPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={setPickedProduct}
        />
      )}
    </div>
  );
}
