import { redirect } from "next/navigation";

/**
 * Halaman login lama — dialihkan ke path baru.
 * Akses via /dashboard-admin/admin/login sekarang diarahkan ke /dashboard-admin/auth/login
 */
export default function OldAdminLoginPage() {
  redirect("/dashboard-admin/auth/login");
}
