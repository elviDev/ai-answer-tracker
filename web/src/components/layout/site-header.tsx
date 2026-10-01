import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClasses } from "@/components/ui/button";

import { Logo } from "./logo";

const links = [
  { href: "/#measures", label: "What it measures" },
  { href: "/#method", label: "Method" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-auto flex items-center gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link href="/login" className="hidden text-sm text-fg-muted hover:text-fg sm:block">
            Sign in
          </Link>
          <Link href="/dashboard" className={buttonClasses({ size: "sm" })}>
            Dashboard →
          </Link>
        </nav>
      </div>
    </header>
  );
}
