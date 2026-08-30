"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Top tab bar for a sidebar hub with more than one screen (design/Madrassa
// Portal.dc.html — e.g. Staff: "Teacher Database | Clock In/Out | Directory |
// Payroll"). The sidebar carries one link per hub; this renders the sibling
// screens across the top of the content area, matching the prototype exactly.
export function HubTabs({ tabs }: { tabs: { label: string; href: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="mb-4 flex gap-2 border-b border-border">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-small font-medium",
              active ? "border-primary text-[var(--primary)]" : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
