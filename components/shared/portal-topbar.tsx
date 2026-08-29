"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PORTALS = [
  { href: "/", label: "Office" },
  { href: "/teacher", label: "Teacher" },
  { href: "/parent", label: "Parent" },
] as const;

// Mirrors the prototype's own top-right Office/Teacher/Parent pill switcher
// (design/README.md). Each portal resolves its own "who's signed in" independently —
// see lib/session.ts — this bar only moves between portals, it never picks a viewer.
export function PortalTopbar({
  viewerName,
  onLogOut,
}: {
  viewerName?: string | null;
  onLogOut?: () => Promise<void>;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || (!pathname.startsWith("/teacher") && !pathname.startsWith("/parent") && !pathname.startsWith("/pupil"));
    return pathname.startsWith(href);
  }

  return (
    <div className="flex items-center justify-end gap-3 border-b border-border bg-[var(--surface)] px-6 py-2.5">
      <div className="flex overflow-hidden rounded-lg border border-border">
        {PORTALS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={cn(
              "px-3 py-1 text-tiny font-medium",
              isActive(p.href)
                ? "bg-primary text-primary-foreground"
                : "bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
      {viewerName && <span className="text-tiny text-[var(--muted)]">{viewerName}</span>}
      {onLogOut && (
        <form action={onLogOut}>
          <button type="submit" className="text-tiny font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline">
            Log out
          </button>
        </form>
      )}
    </div>
  );
}
