"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function SignInForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-micro text-[var(--muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-10 rounded-[11px] border border-[var(--border-2)] bg-white px-3.5 text-small text-[var(--ink)] outline-none focus-visible:border-[var(--brand-accent)] focus-visible:ring-3 focus-visible:ring-[var(--brand-accent)]/18"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-micro text-[var(--muted)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-10 rounded-[11px] border border-[var(--border-2)] bg-white px-3.5 text-small text-[var(--ink)] outline-none focus-visible:border-[var(--brand-accent)] focus-visible:ring-3 focus-visible:ring-[var(--brand-accent)]/18"
        />
      </div>

      {state && !state.ok && <p className="text-tiny text-[var(--alert)]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-10 rounded-[11px] bg-primary text-small font-medium text-primary-foreground hover:bg-[var(--primary-600)] disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
