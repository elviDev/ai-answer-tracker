import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { AnswerSpecimen } from "@/features/marketing/components/answer-specimen";
import { engineNames, faqs, features, steps } from "@/features/marketing/content";
import { faqLd, howToLd, JsonLd, softwareApplicationLd } from "@/lib/seo/json-ld";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name}: track how ChatGPT, Claude, Gemini & Perplexity mention your brand` },
  alternates: { canonical: "/" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareApplicationLd(), faqLd(faqs), howToLd([...steps])]} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="eyebrow">§ AI search visibility</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-end">
          <div>
            <h1 className="display text-[clamp(2.75rem,6.5vw,5.75rem)] text-balance text-fg">
              When someone asks an AI about your market, <em className="text-accent">are you in the answer?</em>
            </h1>
          </div>
          <div className="lg:pb-3">
            <p className="max-w-md text-lg leading-relaxed text-fg-muted">{site.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/dashboard" className={buttonClasses({ variant: "accent", size: "lg" })}>
                Start tracking
              </Link>
              <Link href="#method" className="text-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
                How it works
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-14">
          <AnswerSpecimen />
        </div>
      </section>

      {/* Engines strip */}
      <section aria-label="Supported engines" className="border-y border-ink-rule">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-8">
          <span className="eyebrow text-fg">Asks</span>
          {engineNames.map((name) => (
            <span key={name} className="font-mono text-xs tracking-wide text-fg-muted uppercase">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* What it measures */}
      <section id="measures" aria-labelledby="measures-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">§ 01</p>
            <h2 id="measures-title" className="display mt-4 text-5xl text-fg">
              Six readings from every answer
            </h2>
            <p className="mt-4 text-fg-muted">
              Each run stores the full answer, then measures it the same way every time, so a change in the numbers is a
              change in the engine, not in the method.
            </p>
          </div>
          <ol className="border-t border-ink-rule">
            {features.map((feature, i) => (
              <li key={feature.title} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[4rem_14rem_1fr] sm:gap-6">
                <span className="font-mono text-sm text-fg-subtle">{pad(i + 1)}</span>
                <h3 className="display text-2xl text-fg">{feature.title}</h3>
                <p className="text-fg-muted">{feature.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Method */}
      <section id="method" aria-labelledby="method-title" className="scroll-mt-20 border-t border-ink-rule bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
          <p className="eyebrow">§ 02</p>
          <h2 id="method-title" className="display mt-4 text-5xl text-fg">
            Method
          </h2>
          <ol className="mt-12 grid border-t border-ink-rule md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className={`py-8 md:px-8 ${i > 0 ? "border-t border-line md:border-t-0 md:border-l" : "md:pl-0"}`}>
                <span className="display text-6xl text-accent">{i + 1}</span>
                <h3 className="mt-4 font-medium text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr]">
          <div>
            <p className="eyebrow">§ 03</p>
            <h2 id="faq-title" className="display mt-4 text-5xl text-fg">
              Questions
            </h2>
          </div>
          <dl className="border-t border-ink-rule">
            {faqs.map((faq) => (
              <div key={faq.question} className="grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_1.3fr] md:gap-10">
                <dt className="font-medium text-fg">{faq.question}</dt>
                <dd className="text-fg-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-fg text-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-8 md:flex-row md:items-end md:justify-between">
          <p className="display max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">
            Stop guessing what the machines recommend. <em className="opacity-60">Read it.</em>
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-12 shrink-0 items-center rounded-[3px] bg-canvas px-6 text-[15px] font-medium text-fg transition-opacity hover:opacity-85"
          >
            Open the dashboard →
          </Link>
        </div>
      </section>
    </>
  );
}
