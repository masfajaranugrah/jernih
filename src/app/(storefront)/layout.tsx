import Navbar from "@/app/(storefront)/Navbar";
import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";
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
      <StorefrontFooter />
    </StorefrontProviders>
  );
}
