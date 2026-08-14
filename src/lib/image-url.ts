export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";

  const cleanUrl = url.trim();
  if (!cleanUrl) return "/placeholder.png";

  // Already an absolute external URL (e.g. googleusercontent, cloudinary)
  if (cleanUrl.startsWith("https://") || cleanUrl.startsWith("http://")) {
    // If it's a localhost:3001 or 127.0.0.1:3001 upload URL, return /uploads/filename directly
    // which Next.js rewrite or browser will proxy cleanly
    if (cleanUrl.includes(":3001/uploads/")) {
      const filename = cleanUrl.split("/uploads/").pop();
      return `/uploads/${filename}`;
    }
    return cleanUrl;
  }

  // Relative path: "/uploads/filename.png" or "uploads/filename.png"
  if (cleanUrl.startsWith("/uploads/")) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith("uploads/")) {
    return `/${cleanUrl}`;
  }

  // Fallback
  return cleanUrl;
}

