import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div>
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-fg">Page not found</h1>
        <p className="mt-2 text-fg-muted">The page you are looking for doesn’t exist or was removed.</p>
        <Link href="/" className={buttonClasses({ className: "mt-6" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
