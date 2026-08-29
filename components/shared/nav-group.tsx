"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Collapsible sidebar section (design/Madrassa Portal.dc.html's `sec.toggle`/`sec.isOpen`
// pattern — every portal's sidebar groups are independent accordions, not a static list).
// Starts open only if the current route is one of its own links; the user can freely
// open/close others. State lives in this component so it survives client-side
// navigation within the same layout, same as the prototype's in-memory toggle.
export function NavGroup({
  title,
  hrefs,
  children,
}: {
  title: string;
  hrefs: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = hrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase"
      >
        <span>{title}</span>
        <span className={cn("transition-transform", open && "rotate-90")}>▸</span>
      </button>
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}
