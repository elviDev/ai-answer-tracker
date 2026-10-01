import Link from "next/link";

import { site } from "@/lib/site";

import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-rule">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-fg-muted">
            Self-hosted monitoring of what AI engines say about your brand.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link href="/#measures" className="text-fg-muted hover:text-fg">
            What it measures
          </Link>
          <a href={site.repo} className="text-fg-muted hover:text-fg" rel="noopener">
            Source code
          </a>
          <Link href="/#faq" className="text-fg-muted hover:text-fg">
            FAQ
          </Link>
          <Link href="/llms.txt" className="text-fg-muted hover:text-fg">
            llms.txt
          </Link>
          <Link href="/login" className="text-fg-muted hover:text-fg">
            Sign in
          </Link>
          <Link href="/sitemap.xml" className="text-fg-muted hover:text-fg">
            Sitemap
          </Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="eyebrow mx-auto max-w-7xl px-4 py-4 sm:px-8">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
