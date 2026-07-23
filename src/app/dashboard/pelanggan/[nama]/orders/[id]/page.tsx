"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/imageCompress";

type OrderItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  product?: { id: string; name: string; images: string[] } | null;
  service?: { id: string; name: string; images: string[] } | null;
};

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  subtotal: string;
  discountAmount: string;
  shippingCost: string;
  total: string;
  notes: string | null;
  paymentMethod: string | null;
  paymentProof: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
  address: Address | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  CONFIRMED: "Dikonfirmasi",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-[#ffdad6] text-[#93000a]",
  CONFIRMED: "bg-[#064e3b]/10 text-[#064e3b]",
  PROCESSING: "bg-[#d9dff5] text-[#5c6274]",
  SHIPPED: "bg-[#d9dff5] text-[#5c6274]",
  DELIVERED: "bg-[#e7e8e9] text-[#404944]",
  CANCELLED: "bg-[#e7e8e9] text-[#707974]",
  REFUNDED: "bg-[#e7e8e9] text-[#707974]",
};

function formatRupiah(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return "Rp " + (isNaN(num) ? 0 : num).toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nomor rekening perusahaan (bisa diganti via settings nanti) */
const BANK_ACCOUNTS = [
  { bank: "BCA", number: "1234567890", name: "Jernih Creatife" },
  { bank: "Mandiri", number: "9876543210", name: "Jernih Creatife" },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ nama: string; id: string }>;
}) {
  const { nama, id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Pesanan tidak ditemukan");
          if (res.status === 403) throw new Error("Anda tidak memiliki akses ke pesanan ini");
          throw new Error("Gagal memuat pesanan");
        }
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  /** Upload bukti pembayaran */
  async function handleUploadPayment(imageUrl: string) {
    if (!imageUrl.trim()) return;
    setUploading(true);
    setUploadError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProof: imageUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Gagal upload bukti pembayaran");
      }
      const updated = await res.json();
      setOrder(updated);
      setSuccessMsg("Bukti pembayaran berhasil dikirim! Status pesanan telah diperbarui.");
    } catch (e: any) {
      setUploadError(e.message ?? "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  }

  /** Buka chat: kirim pesan dari pelanggan + bot message dari admin */
  async function handleChatAdmin() {
    if (!order) return;

    const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
    const itemList = order.items.map((i) => `• ${i.name} x${i.quantity} = ${formatRupiah(i.subtotal)}`).join("\n");

    try {
      // 0. Dapatkan admin ID untuk receiver chat
      let adminId = "";
      try {
        const adminRes = await fetch("/api/chat/admin-id");
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          adminId = adminData.id;
        }
      } catch { /* fallback */ }

      // 1. Kirim pesan dari pelanggan berisi detail pesanan
      let customerMsg = `Halo admin, saya ingin konfirmasi pesanan ${orderNumber}:\n\n${itemList}\n\nTotal: ${formatRupiah(order.total)}`;

      if (order.paymentProof) {
        customerMsg += `\n\nBukti pembayaran:\n${order.paymentProof}`;
      }

      if (adminId) {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: customerMsg, receiverId: adminId }),
        });
      }

      // 2. Kirim bot message dari admin (auto-generated via backend)
      await fetch(`/api/orders/${order.id}/bot-message`, { method: "POST" });
    } catch {
      // Abaikan error — tidak kritikal
    }

    // 3. Redirect ke halaman chat
    router.push(`/dashboard/pelanggan/${nama}/chat`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#064e3b] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 px-5 py-4 text-sm font-semibold text-[#93000a]">
        {error}
      </div>
    );
  }

  if (!order) return null;

  const isPending = order.status === "PENDING";
  const isPaid = order.status === "CONFIRMED" || order.status === "PROCESSING" || order.status === "SHIPPED";

  return (
    <div className="space-y-6">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/pelanggan/${nama}/orders`)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#475569] hover:bg-[#e2e8f0] transition"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#191c1d]">Detail Pesanan</h1>
          <p className="text-xs text-[#707974]">{order.orderNumber}</p>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-3 text-sm font-medium text-[#064e3b]">
          {successMsg}
        </div>
      )}

      {/* Status card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#707974]">Status</p>
            <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] ?? "bg-[#e7e8e9] text-[#404944]"}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#707974]">Total</p>
            <p className="text-xl font-bold text-[#003527]">{formatRupiah(order.total)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#475569]">Dibuat: {formatDate(order.createdAt)}</p>
      </div>

      {/* Tracking Timeline */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-[#707974] uppercase tracking-wider mb-4">Status Pesanan</p>
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#e2e8f0]" />
          {[
            { key: "PENDING", label: "Pesanan Dibuat", icon: "🛒" },
            { key: "CONFIRMED", label: "Pembayaran Dikonfirmasi", icon: "✅" },
            { key: "PROCESSING", label: "Diproses", icon: "⚙️" },
            { key: "SHIPPED", label: "Dikirim", icon: "🚚" },
            { key: "DELIVERED", label: "Selesai", icon: "🎉" },
          ].map((step, idx) => {
            const orderIdx = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED"].indexOf(order.status);
            const isActive = idx <= orderIdx;
            const isCurrent = idx === orderIdx;
            return (
              <div key={step.key} className={`relative flex gap-4 pb-5 ${idx === 4 ? "pb-0" : ""}`}>
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                  isActive ? "bg-[#064e3b] text-white" : "bg-[#e2e8f0] text-[#94a3b8]"
                } ${isCurrent ? "ring-2 ring-[#064e3b]/30" : ""}`}>
                  {isActive ? step.icon : "○"}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className={`text-sm font-semibold ${isActive ? "text-[#191c1d]" : "text-[#94a3b8]"}`}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-xs text-[#064e3b]">(Saat ini)</span>}
                  </p>
                  {isCurrent && step.key === "SHIPPED" && order.shippingCourier && (
                    <p className="text-xs text-[#064e3b] font-medium mt-0.5">
                      Kurir: {order.shippingCourier}{order.trackingNumber ? ` • No. Resi: ${order.trackingNumber}` : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Item Pesanan</h2>
        <div className="divide-y divide-[#e2e8f0]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9]">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#94a3b8] text-xl">📦</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#191c1d] truncate">{item.name}</p>
                <p className="text-xs text-[#707974]">{item.quantity} x {formatRupiah(item.price)}</p>
              </div>
              <p className="text-sm font-semibold text-[#191c1d]">{formatRupiah(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-3 space-y-1.5 border-t border-[#e2e8f0] pt-3 text-sm">
          <div className="flex justify-between text-[#475569]">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-[#dc2626]">
              <span>Diskon</span>
              <span>-{formatRupiah(order.discountAmount)}</span>
            </div>
          )}
          {Number(order.shippingCost) > 0 && (
            <div className="flex justify-between text-[#475569]">
              <span>Ongkos Kirim</span>
              <span>{formatRupiah(order.shippingCost)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#191c1d] pt-1 border-t border-[#e2e8f0]">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Alamat pengiriman */}
      {order.address && (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-[#191c1d]">Alamat Pengiriman</h2>
          <p className="text-sm text-[#191c1d] font-medium">{order.address.recipient}</p>
          <p className="text-xs text-[#475569]">{order.address.phone}</p>
          <p className="text-xs text-[#475569] mt-1">
            {order.address.street}, {order.address.city}, {order.address.province} {order.address.postalCode}
          </p>
        </div>
      )}

      {/* Payment section */}
      {isPending && (
        <>
          {/* Bank accounts */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Pembayaran Transfer Bank</h2>
            <div className="space-y-3">
              {BANK_ACCOUNTS.map((acc) => (
                <div key={acc.bank} className="flex items-center justify-between rounded-lg bg-[#f8f9fa] px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-[#191c1d]">{acc.bank}</p>
                    <p className="text-lg font-black text-[#003527] tracking-wider">{acc.number}</p>
                    <p className="text-xs text-[#475569]">a.n. {acc.name}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(acc.number)}
                    className="shrink-0 rounded-lg bg-[#064e3b] px-3 py-2 text-xs font-bold text-white hover:bg-[#043b2d] transition"
                  >
                    Salin
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload payment proof */}
          <UploadPaymentForm
            onUpload={handleUploadPayment}
            uploading={uploading}
            error={uploadError}
          />
        </>
      )}

      {/* Payment proof already uploaded */}
      {order.paymentProof && (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-[#191c1d]">Bukti Pembayaran</h2>
          <img
            src={order.paymentProof}
            alt="Bukti pembayaran"
            className="max-h-48 w-full rounded-lg object-contain bg-[#f8f9fa]"
          />
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-[#191c1d]">Catatan</h2>
          <p className="text-sm text-[#475569]">{order.notes}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleChatAdmin}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d]"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          </svg>
          {isPending ? "Konfirmasi ke Admin" : "Hubungi Admin"}
        </button>
      </div>
    </div>
  );
}

/** Komponen form upload bukti bayar — pilih file, auto-compress, upload */
function UploadPaymentForm({
  onUpload,
  uploading,
  error,
}: {
  onUpload: (url: string) => Promise<void>;
  uploading: boolean;
  error: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [compressing, setCompressing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [localError, setLocalError] = useState("");

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  /** Handle file selection & compress */
  async function handleFile(raw: File) {
    setLocalError("");

    if (!raw.type.startsWith("image/")) {
      setLocalError("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (raw.size > MAX_SIZE) {
      setLocalError("Ukuran maksimal 10MB");
      return;
    }

    setCompressing(true);
    try {
      clearPreview();

      const compressed = await compressImage(raw);
      setFile(compressed);

      // Preview dari hasil kompresi
      const objectUrl = URL.createObjectURL(compressed);
      setPreview(objectUrl);

      const savedKb = Math.round((raw.size - compressed.size) / 1024);
      if (savedKb > 0) {
        // Info ukuran (opsional, hanya log)
        console.log(`Kompresi: ${Math.round(raw.size/1024)}KB → ${Math.round(compressed.size/1024)}KB (hemat ${savedKb}KB)`);
      }
    } catch {
      // Fallback: pakai file asli jika kompresi gagal
      setFile(raw);
      setPreview(URL.createObjectURL(raw));
    } finally {
      setCompressing(false);
    }
  }

  /** Bersihkan object URL lama saat ganti file */
  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function removeFile() {
    clearPreview();
  }

  /** Upload file → dapat URL → submit */
  async function handleSubmit() {
    if (!file) return;
    setUploadingFile(true);
    setLocalError("");

    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.message ?? "Gagal upload gambar");
      }

      const uploadData = await uploadRes.json();
      const url = uploadData.urls?.[0];
      if (!url) throw new Error("Tidak mendapatkan URL gambar");

      await onUpload(url);
    } catch (e: any) {
      setLocalError(e.message ?? "Terjadi kesalahan saat upload");
    } finally {
      setUploadingFile(false);
    }
  }

  const isBusy = uploading || uploadingFile || compressing;

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-[#191c1d]">Upload Bukti Pembayaran</h2>
      <p className="mb-3 text-xs text-[#475569]">
        Jika sudah transfer, upload bukti pembayaran berupa foto screenshot transfer.
      </p>

      <div className="space-y-3">
        {/* Drop zone / input */}
        {!preview ? (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
              compressing
                ? "border-[#064e3b]/30 bg-[#f0fdf4]"
                : "border-[#bfc9c3] hover:border-[#064e3b] hover:bg-[#f8f9fa]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              disabled={compressing}
              className="hidden"
            />
            {compressing ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#064e3b] border-t-transparent" />
                <span className="text-sm font-medium text-[#064e3b]">Mengompresi gambar...</span>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#064e3b]/10 text-[#064e3b]">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#191c1d]">
                    Klik untuk pilih gambar
                  </p>
                  <p className="text-xs text-[#707974]">atau drag & drop file di sini</p>
                </div>
                <p className="text-[10px] text-[#94a3b8]">Format: JPEG, PNG, WebP. Maks 10MB</p>
              </>
            )}
          </label>
        ) : (
          /* Preview setelah pilih file */
          <div className="overflow-hidden rounded-lg bg-[#f8f9fa]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview bukti bayar"
              className="max-h-48 w-full object-contain"
            />
            <div className="flex items-center justify-between border-t border-[#e2e8f0] px-3 py-2">
              <span className="truncate text-xs text-[#475569]">
                {file?.name ?? "Gambar"} ({file ? Math.round(file.size / 1024) : 0}KB)
              </span>
              <button
                type="button"
                onClick={removeFile}
                disabled={isBusy}
                className="text-xs font-semibold text-[#dc2626] hover:underline disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {(error || localError) && (
          <p className="text-xs font-medium text-[#dc2626]">{error || localError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isBusy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#043b2d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {compressing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengompresi...
            </>
          ) : uploading || uploadingFile ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mengupload...
            </>
          ) : (
            "Sudah Bayar"
          )}
        </button>
      </div>
    </div>
  );
}
