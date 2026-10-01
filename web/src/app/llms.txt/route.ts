import { faqs, features, steps } from "@/features/marketing/content";
import { absoluteUrl, site } from "@/lib/site";

// Built once at build time and served as a static file.
export const dynamic = "force-static";

/** llms.txt (https://llmstxt.org): a concise, Markdown summary of the site for LLMs and AI agents. */
export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "AI Answer Tracker is a self-hosted tool for generative engine optimization (GEO). It repeatedly asks AI engines a question (for example “best CRM for startups”), stores every answer, and measures how a brand appears in them.",
    "",
    "## Features",
    "",
    ...features.map((f) => `- **${f.title}**: ${f.body}`),
    "",
    "## How it works",
    "",
    ...steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.body}`),
    "",
    "## FAQ",
    "",
    ...faqs.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): product overview, features and FAQ`,
    `- [Dashboard](${absoluteUrl("/dashboard")}): private, requires sign-in`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
