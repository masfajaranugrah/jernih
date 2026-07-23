import { ToastProvider } from "./components/Toast";
import Providers from "./admin/providers";
import AdminShell from "./AdminShell";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ToastProvider>
        {/* Material Symbols font untuk semua halaman admin */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </Providers>
  );
}
