import type { ElementType, ReactNode } from "react";

import { BrandMark } from "./brand-mark";

type Highlight = {
  icon: ElementType;
  title: string;
  description: string;
};

type AuthScaffoldProps = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  highlights: Highlight[];
  panelTitle: string;
  panelDescription: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthScaffold({
  eyebrow,
  heroTitle,
  heroDescription,
  highlights,
  panelTitle,
  panelDescription,
  children,
  footer,
}: AuthScaffoldProps) {
  return (
    <div className="h-screen overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid h-full min-h-0 max-w-7xl gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="shell-hero hidden min-h-0 flex-col justify-start overflow-hidden p-4 sm:p-5 lg:flex lg:p-6">
          <div className="space-y-5">
            <BrandMark caption="Eco-premium role-based platform" />

            <div className="space-y-3">
              <span className="shell-chip shell-chip-primary">{eyebrow}</span>
              <div className="max-w-xl space-y-2.5">
                <h1 className="text-display text-3xl font-semibold tracking-[-0.055em] text-[var(--text-primary)] sm:text-4xl lg:text-[2.5rem]">
                  {heroTitle}
                </h1>
                <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                  {heroDescription}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/72 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Shared system
                </p>
                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  4 roles
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/72 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Response rhythm
                </p>
                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Faster
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/72 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Product tone
                </p>
                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Calmer
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="shell-card flex items-start gap-3 p-3 sm:p-3.5"
              >
                <div className="shell-icon-chip shrink-0">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)] sm:text-sm">
                    {item.title}
                  </p>
                  <p className="line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="shell-panel flex min-h-0 items-start justify-start overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div className="w-full max-w-md space-y-5 lg:pt-2">
            <div className="space-y-2.5">
              <span className="shell-chip">{eyebrow}</span>
              <div className="space-y-1.5">
                <h2 className="text-display text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-[1.7rem]">
                  {panelTitle}
                </h2>
                <p className="text-xs leading-5 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
                  {panelDescription}
                </p>
              </div>
            </div>

            {children}

            <div className="shell-divider pt-4 text-sm text-[var(--text-secondary)]">
              {footer}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
