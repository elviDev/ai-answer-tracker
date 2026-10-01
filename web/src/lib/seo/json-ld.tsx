import type { FaqItem } from "@/features/marketing/content";
import { absoluteUrl, site } from "@/lib/site";

type JsonLdObject = Record<string, unknown>;

/** Renders structured data. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const organizationLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/icon.svg"),
  sameAs: [site.repo],
});

export const websiteLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: site.name,
  url: site.url,
  description: site.description,
  publisher: { "@id": absoluteUrl("/#organization") },
  inLanguage: "en",
});

export const softwareApplicationLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  url: site.url,
  description: site.description,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "AI search visibility monitoring",
  operatingSystem: "Web, Docker",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Track brand mentions in ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews",
    "Rank your brand against competitors in AI answers",
    "Detect when AI answers cite your website",
    "Change detection between answers over time",
    "Scheduled runs with full answer history",
  ],
  publisher: { "@id": absoluteUrl("/#organization") },
});

export const faqLd = (faqs: FaqItem[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export const howToLd = (steps: { title: string; body: string }[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: `How to track your brand in AI answers with ${site.name}`,
  step: steps.map((step, i) => ({ "@type": "HowToStep", position: i + 1, name: step.title, text: step.body })),
});
