import Navbar from "@/app/(storefront)/Navbar";
import StorefrontProviders from "./StorefrontProviders";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontProviders>
      <Navbar />
      {children}
    </StorefrontProviders>
  );
}
