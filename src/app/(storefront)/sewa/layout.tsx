import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";

export default function SewaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StorefrontFooter />
    </>
  );
}
