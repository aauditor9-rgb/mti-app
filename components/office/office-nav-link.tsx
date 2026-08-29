"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function OfficeNavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-small font-medium transition-colors",
        active
          ? "bg-[var(--surface-2)] text-[var(--primary)]"
          : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
