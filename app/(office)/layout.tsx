import { CalendarCheck, GraduationCap, Users } from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { getMadrasah } from "@/lib/db/queries";

const STATIC_GROUPS = ["Overview", "Teaching & Learning", "Reports & Assessment", "Operations"];

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const madrasah = await getMadrasah();
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border bg-[var(--surface)] p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
            {madrasah.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-small font-medium text-[var(--ink)]">{madrasah.name}</p>
            <p className="truncate text-tiny text-[var(--muted)]">{today}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              People
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/students" icon={<Users className="size-4" />}>
                Students
              </OfficeNavLink>
              <OfficeNavLink href="/classes" icon={<GraduationCap className="size-4" />}>
                Classes &amp; Allocation
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Attendance &amp; Behaviour
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/attendance" icon={<CalendarCheck className="size-4" />}>
                Attendance
              </OfficeNavLink>
            </div>
          </div>

          {STATIC_GROUPS.map((group) => (
            <p
              key={group}
              className="px-2.5 text-tiny font-medium tracking-wide text-[var(--muted-2)] uppercase"
            >
              {group}
            </p>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
