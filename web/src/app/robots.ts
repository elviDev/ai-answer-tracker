import type { MetadataRoute } from "next";

import { absoluteUrl, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        // Private app surfaces: nothing useful to index and they require a session.
        disallow: ["/dashboard", "/login", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
