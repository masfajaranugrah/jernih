import { ToastProvider } from "./components/Toast";
import Providers from "./admin/providers";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ToastProvider>{children}</ToastProvider>
    </Providers>
  );
}
