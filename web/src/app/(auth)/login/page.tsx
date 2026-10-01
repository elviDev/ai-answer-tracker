import type { Metadata } from "next";

import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="hidden flex-col justify-between border-r border-ink-rule bg-fg p-12 text-canvas lg:flex">
        <Logo className="text-canvas" />
        <blockquote>
          <p className="display text-5xl leading-[1.05]">
            “Every answer is stored, so you can date the day an engine changed its mind.”
          </p>
          <footer className="mt-6 font-mono text-xs tracking-widest uppercase opacity-60">Answer Tracker · Method</footer>
        </blockquote>
      </section>
      <section className="flex flex-col justify-center px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="eyebrow mt-10 lg:mt-0">Dashboard</p>
          <h1 className="display mt-2 text-5xl text-fg">Sign in.</h1>
          <p className="mt-3 text-sm text-fg-muted">Use the admin password from ADMIN_PASSWORD.</p>
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
      </section>
    </main>
  );
}
