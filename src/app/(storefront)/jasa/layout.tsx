import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";

export default function JasaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StorefrontFooter />
    </>
  );
}
