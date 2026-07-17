/**
 * Kompresi gambar client-side sebelum upload — hemat storage.
 * Resize max 1600px + konversi ke WebP (~10x lebih kecil dari JPEG asli).
 */
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.8,
): Promise<File> {
  // GIF dilewati (canvas mematikan animasi), non-image dilewati
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob || blob.size >= file.size) return file; // hasil lebih besar → pakai asli

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", {
      type: "image/webp",
    });
  } catch {
    return file; // gagal kompres → upload asli saja
  }
}

const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25 MB
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/** Validasi video sebelum upload. Return pesan error, atau null jika valid. */
export function validateVideo(file: File): string | null {
  if (!VIDEO_TYPES.includes(file.type)) {
    return "Format video harus MP4, WebM, atau MOV";
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return "Ukuran video maksimal 25MB";
  }
  return null;
}
