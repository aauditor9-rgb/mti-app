import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Contact,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Moon,
  Receipt,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { PortalTopbar } from "@/components/shared/portal-topbar";
import { NavGroup } from "@/components/shared/nav-group";
import { getCurrentStaff, getMadrasah } from "@/lib/db/queries";
import { signOut } from "@/app/sign-in/actions";

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const madrasah = await getMadrasah();
  const currentStaff = await getCurrentStaff(madrasah.id);

  if (!currentStaff || currentStaff.role !== "Office Staff") {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
        <PortalTopbar onLogOut={signOut} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="max-w-sm rounded-xl border border-border bg-[var(--surface)] p-6 text-center text-small text-[var(--muted)]">
            This account isn&apos;t linked to an office staff record. Ask another office
            member to grant access, or sign in with a different account.
          </p>
        </div>
      </div>
    );
  }

  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <PortalTopbar viewerName={currentStaff.name} onLogOut={signOut} />
      <div className="flex flex-1">
      <aside className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-[var(--surface)] p-4">
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
          <NavGroup title="Overview" hrefs={["/", "/calendar", "/tasks"]}>
            <OfficeNavLink href="/" icon={<LayoutDashboard className="size-4" />}>
              Dashboard
            </OfficeNavLink>
            <OfficeNavLink href="/calendar" icon={<Calendar className="size-4" />}>
              Calendar
            </OfficeNavLink>
            <OfficeNavLink href="/tasks" icon={<ListTodo className="size-4" />}>
              Tasks
            </OfficeNavLink>
          </NavGroup>

          <NavGroup title="People" hrefs={["/students", "/classes", "/admissions", "/staff"]}>
            <OfficeNavLink href="/students" icon={<Users className="size-4" />}>
              Students
            </OfficeNavLink>
            <OfficeNavLink href="/classes" icon={<GraduationCap className="size-4" />}>
              Classes &amp; Allocation
            </OfficeNavLink>
            <OfficeNavLink href="/admissions" icon={<ClipboardList className="size-4" />}>
              Admissions
            </OfficeNavLink>
            <OfficeNavLink href="/staff/directory" icon={<Contact className="size-4" />}>
              Staff
            </OfficeNavLink>
          </NavGroup>

          <NavGroup title="Attendance & Behaviour" hrefs={["/attendance", "/ihsan", "/concerns"]}>
            <OfficeNavLink href="/attendance" icon={<CalendarCheck className="size-4" />}>
              Attendance
            </OfficeNavLink>
            <OfficeNavLink href="/ihsan" icon={<Sparkles className="size-4" />}>
              Iḥsān &amp; Concerns
            </OfficeNavLink>
          </NavGroup>

          <NavGroup
            title="Teaching & Learning"
            hrefs={["/teaching-overview", "/lesson-plans", "/homework", "/salah", "/progress-trackers/duas", "/hifz"]}
          >
            <OfficeNavLink href="/teaching-overview" icon={<BookOpen className="size-4" />}>
              Teaching Overview
            </OfficeNavLink>
            <OfficeNavLink href="/lesson-plans" icon={<CalendarDays className="size-4" />}>
              Lesson Plans
            </OfficeNavLink>
            <OfficeNavLink href="/homework" icon={<BookOpen className="size-4" />}>
              Homework
            </OfficeNavLink>
            <OfficeNavLink href="/salah" icon={<Moon className="size-4" />}>
              Ṣalāh &amp; Tarbiyah
            </OfficeNavLink>
            <OfficeNavLink href="/progress-trackers/duas" icon={<ClipboardCheck className="size-4" />}>
              Progress Trackers
            </OfficeNavLink>
            <OfficeNavLink href="/hifz" icon={<Moon className="size-4" />}>
              Hifz Programme
            </OfficeNavLink>
          </NavGroup>

          <NavGroup title="Reports & Assessment" hrefs={["/reports", "/examinations"]}>
            <OfficeNavLink href="/reports" icon={<GraduationCap className="size-4" />}>
              Reports
            </OfficeNavLink>
            <OfficeNavLink href="/examinations" icon={<ClipboardList className="size-4" />}>
              Examinations
            </OfficeNavLink>
          </NavGroup>

          <NavGroup
            title="Operations"
            hrefs={["/finance/fees", "/communications/messages", "/safeguarding/medical", "/settings/school"]}
          >
            <OfficeNavLink href="/finance/fees" icon={<Receipt className="size-4" />}>
              Finance
            </OfficeNavLink>
            <OfficeNavLink href="/communications/messages" icon={<Inbox className="size-4" />}>
              Communications
            </OfficeNavLink>
            <OfficeNavLink href="/safeguarding/medical" icon={<ShieldCheck className="size-4" />}>
              Safeguarding
            </OfficeNavLink>
            <OfficeNavLink href="/settings/school" icon={<SettingsIcon className="size-4" />}>
              Settings
            </OfficeNavLink>
          </NavGroup>
        </nav>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
