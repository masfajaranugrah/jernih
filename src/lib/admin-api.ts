// Helper untuk API call admin — semua lewat BFF proxy
// Baca HttpOnly cookie server-side, aman dari XSS
// Gunakan ini di semua halaman admin dashboard

export async function adminApi<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const base = "/api/admin/proxy";
  const url = `${base}/${path.replace(/^\//, "")}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    // Redirect ke login — session expired
    if (typeof window !== "undefined") {
      await fetch("/api/auth/logout", { method: "POST" });
      sessionStorage.setItem("auth_expired", "1");
      window.location.href = "/dashboard-admin/admin/login";
    }
    throw new Error("Session expired");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `API error: ${res.status}`);
  }

  return data as T;
}
