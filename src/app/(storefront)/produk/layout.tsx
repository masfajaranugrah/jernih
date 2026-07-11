import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";

export default function ProdukLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StorefrontFooter />
    </>
  );
}
