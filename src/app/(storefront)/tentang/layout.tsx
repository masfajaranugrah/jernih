import StorefrontFooter from "@/app/(storefront)/StorefrontFooter";

export default function TentangLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StorefrontFooter />
    </>
  );
}
