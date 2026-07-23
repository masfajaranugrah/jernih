"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/lib/auth-context";

export default function StorefrontProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data selalu dianggap stale → fetch ulang setiap kali komponen di-mount
            staleTime: 0,
            // Refresh otomatis saat user kembali ke tab browser
            refetchOnWindowFocus: true,
            // Retry sekali jika gagal
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
