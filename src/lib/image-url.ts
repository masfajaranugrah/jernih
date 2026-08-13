/**
 * Resolves a backend image URL correctly regardless of environment.
 *
 * Old data in DB may have: "http://localhost:3001/uploads/file.png"
 * New data (after fix)  : "/uploads/file.png"
 *
 * This function normalises both into an absolute URL using the env variable
 * so the browser can always reach the image.
 */
const BACKEND_BASE =
  (typeof window === "undefined"
    ? process.env.API_URL          // server-side
    : process.env.NEXT_PUBLIC_API_URL // client-side
  )?.replace(/\/api$/, "") ?? "http://localhost:3001";

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";

  // Already an absolute URL from an external host (e.g. googleapis, cloudinary)
  if (url.startsWith("https://") || url.startsWith("http://")) {
    // Legacy: stored as "http://localhost:3001/uploads/..." — swap host to current BACKEND_BASE
    if (url.includes("localhost:3001/uploads/") || url.includes("127.0.0.1:3001/uploads/")) {
      const filename = url.split("/uploads/").pop();
      return `${BACKEND_BASE}/uploads/${filename}`;
    }
    // External URL — return as-is
    return url;
  }

  // Relative path: "/uploads/filename.png"
  if (url.startsWith("/uploads/")) {
    return `${BACKEND_BASE}${url}`;
  }

  // Fallback
  return url;
}
