import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd, organizationLd, websiteLd } from "@/lib/seo/json-ld";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
