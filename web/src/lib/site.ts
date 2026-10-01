/** Public, non-secret site configuration shared by metadata, JSON-LD, robots, sitemap and llms.txt. */
export const site = {
  name: "AI Answer Tracker",
  shortName: "Answer Tracker",
  tagline: "See how AI engines talk about your brand, over time",
  description:
    "Track how ChatGPT, Claude, Gemini, Perplexity and Google AI Overviews answer questions about your brand. " +
    "Measure mentions, ranking against competitors, citations and answer changes over time.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  repo: "https://github.com/elviDev/ai-answer-tracker",
  keywords: [
    "AI search visibility",
    "generative engine optimization",
    "GEO",
    "AI brand monitoring",
    "ChatGPT brand mentions",
    "Perplexity tracking",
    "Google AI Overview tracking",
    "LLM answer tracking",
  ],
} as const;

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
