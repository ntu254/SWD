import { ArrowRight, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { BrandMark } from "../components/ui/brand-mark";
import { Button } from "../components/ui/button";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="shell-panel w-full max-w-3xl overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
          <div className="space-y-4 lg:space-y-5 p-8 sm:p-10">
            <BrandMark caption="Access policy" />
            <div className="space-y-3">
              <span className="shell-chip shell-chip-danger">Unauthorized</span>
              <h1 className="text-display text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] sm:text-5xl">
                You do not have permission to view this page.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                The requested route is protected by role permissions. Sign in with
                an account that has access, or return to the login screen to switch
                workspaces.
              </p>
            </div>

            <Button asChild size="lg">
              <Link to="/login">
                Return to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="border-t border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="rounded-[30px] border border-[rgba(217,124,87,0.16)] bg-[var(--peach-100)] p-6">
              <div className="shell-icon-chip h-14 w-14 rounded-[22px] bg-white/72 text-[var(--peach-600)]">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Role-restricted route
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Route paths and access logic remain unchanged. This page now simply
                communicates the restriction more clearly and gives users a direct
                way back into the correct workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
