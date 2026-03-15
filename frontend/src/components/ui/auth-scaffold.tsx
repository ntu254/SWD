import type { ElementType, ReactNode } from "react";

import { BrandMark } from "./brand-mark";
import { cn } from "../../lib/utils";

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
    <div className="h-dvh overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid h-full min-h-0 max-w-7xl gap-3.5 lg:grid-cols-[minmax(0,1.07fr)_minmax(420px,0.93fr)] lg:gap-4">
        <section className="shell-hero relative hidden min-h-0 overflow-hidden lg:flex lg:p-6 xl:p-7">
          <div className="pointer-events-none absolute left-8 top-8 h-36 w-36 rounded-full bg-[rgba(126,199,154,0.14)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-8 h-44 w-44 rounded-full bg-[rgba(121,157,230,0.12)] blur-3xl" />

          <div className="relative flex h-full w-full flex-col">
            <div className="flex flex-1 flex-col justify-between gap-6 xl:gap-7">
              <div className="space-y-5 xl:space-y-6">
                <BrandMark caption="Nền tảng vai trò xanh, gọn và dễ dùng" />

                <div className="max-w-2xl space-y-3.5">
                  <span className="shell-chip shell-chip-primary">{eyebrow}</span>
                  <div className="space-y-2.5">
                    <h1 className="max-w-[13ch] text-display text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.065em] text-[var(--text-primary)] xl:text-[2.95rem]">
                      {heroTitle}
                    </h1>
                    <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-[0.98rem]">
                      {heroDescription}
                    </p>
                  </div>
                </div>

                <div className="grid max-w-2xl gap-2.5 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/75 bg-white/78 p-3.5 shadow-[0_12px_24px_rgba(27,58,49,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Hệ thống chung
                    </p>
                    <p className="mt-1.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      4 vai trò
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Công dân, thu gom, doanh nghiệp và quản trị cùng trong một hệ thống.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/75 bg-white/78 p-3.5 shadow-[0_12px_24px_rgba(27,58,49,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Nhịp vận hành
                    </p>
                    <p className="mt-1.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      Nhanh hơn
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Điều hướng rõ ràng hơn và tập trung hơn vào từng tác vụ hằng ngày.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/75 bg-white/78 p-3.5 shadow-[0_12px_24px_rgba(27,58,49,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Tinh thần sản phẩm
                    </p>
                    <p className="mt-1.5 text-[1.65rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      Êm hơn
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Bề mặt xanh dịu và nhịp bố cục SaaS gọn gàng, dễ quan sát.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Điểm nổi bật
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Cân bằng cho vận hành hằng ngày
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {highlights.map((item, index) => {
                    const spansRow =
                      highlights.length % 2 === 1 && index === highlights.length - 1;

                    return (
                      <div
                        key={item.title}
                        className={cn(
                          "shell-card flex min-h-[128px] flex-col justify-between gap-4 border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,251,248,0.92))] p-3.5 shadow-[0_16px_30px_rgba(30,58,50,0.06)]",
                          spansRow ? "sm:col-span-2" : "",
                        )}
                      >
                        <div className="shell-icon-chip h-11 w-11 shrink-0 rounded-[16px]">
                          <item.icon className="h-4.5 w-4.5" />
                        </div>

                        <div className="space-y-2">
                          <p className="text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                            {item.title}
                          </p>
                          <p className="text-sm leading-5 text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="shell-panel relative flex min-h-0 items-center justify-center overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[rgba(126,199,154,0.1)] blur-3xl" />

          <div className="relative w-full max-w-[430px]">
            <div className="mb-5 lg:hidden">
              <BrandMark compact caption="Không gian làm việc theo vai trò" />
            </div>

            <div className="rounded-[32px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,247,0.94))] p-5 shadow-[0_22px_44px_rgba(26,58,49,0.08)] sm:p-6">
              <div className="space-y-5">
                <div className="space-y-3">
                  <span className="shell-chip">{eyebrow}</span>
                  <div className="space-y-2">
                    <h2 className="text-display text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-[2.1rem]">
                      {panelTitle}
                    </h2>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {panelDescription}
                    </p>
                  </div>
                </div>

                {children}

                <div className="shell-divider pt-4 text-sm text-[var(--text-secondary)]">
                  {footer}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
