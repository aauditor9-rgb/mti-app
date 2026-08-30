import { getMadrasah } from "@/lib/db/queries";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const madrasah = await getMadrasah();

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-small font-medium text-primary-foreground">
            {madrasah.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <p className="text-small font-medium text-[var(--ink)]">{madrasah.name}</p>
        </div>

        <h1 className="font-heading text-h3 font-medium text-[var(--ink)]">Sign in</h1>
        <p className="mt-1 text-small text-[var(--muted)]">Office, teacher and parent accounts all sign in here.</p>

        <div className="mt-4">
          <SignInForm next={next ?? null} />
        </div>
      </div>
    </div>
  );
}
