import {
  BookMarked,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock,
  HeartHandshake,
  Inbox,
  PenSquare,
  Sparkles,
  SunMoon,
  Users,
} from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { PortalTopbar } from "@/components/shared/portal-topbar";
import { NavGroup } from "@/components/shared/nav-group";
import { getCurrentStaff, getMadrasah } from "@/lib/db/queries";
import { signOut } from "@/app/sign-in/actions";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const madrasah = await getMadrasah();
  const currentStaff = await getCurrentStaff(madrasah.id);

  if (!currentStaff) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
        <PortalTopbar onLogOut={signOut} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="max-w-sm rounded-xl border border-border bg-[var(--surface)] p-6 text-center text-small text-[var(--muted)]">
            This account isn&apos;t linked to a staff record with portal access. Ask the
            office to grant access, or sign in with a different account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <PortalTopbar viewerName={currentStaff.name} onLogOut={signOut} />
      <div className="flex flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border bg-[var(--surface)] p-4">
          <div className="px-1">
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teacher Portal</p>
            <p className="truncate text-small font-medium text-[var(--ink)]">{currentStaff.name}</p>
          </div>

          <nav className="flex flex-col gap-3">
            <NavGroup title="Today" hrefs={["/teacher", "/teacher/clock", "/teacher/register", "/teacher/students"]}>
              <OfficeNavLink href="/teacher" icon={<SunMoon className="size-4" />}>
                Today&apos;s Lesson
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/clock" icon={<Clock className="size-4" />}>
                Check-in &amp; Clock
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/register" icon={<CalendarCheck className="size-4" />}>
                My Register
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/students" icon={<Users className="size-4" />}>
                My Students
              </OfficeNavLink>
            </NavGroup>

            <NavGroup
              title="Teaching"
              hrefs={["/teacher/lesson-plans", "/teacher/holiday-revision", "/teacher/set-work", "/teacher/homework-review", "/teacher/hifz-diary"]}
            >
              <OfficeNavLink href="/teacher/lesson-plans" icon={<CalendarDays className="size-4" />}>
                Lesson Plans
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/holiday-revision" icon={<CalendarClock className="size-4" />}>
                Holiday Revision
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/set-work" icon={<PenSquare className="size-4" />}>
                Set Work
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/homework-review" icon={<BookOpen className="size-4" />}>
                Homework Review
              </OfficeNavLink>
              {currentStaff.isHifzTeacher && (
                <OfficeNavLink href="/teacher/hifz-diary" icon={<BookMarked className="size-4" />}>
                  Hifz Diary
                </OfficeNavLink>
              )}
            </NavGroup>

            <NavGroup title="Pastoral" hrefs={["/teacher/concerns", "/teacher/ihsan", "/teacher/messages"]}>
              <OfficeNavLink href="/teacher/concerns" icon={<HeartHandshake className="size-4" />}>
                Concerns
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/ihsan" icon={<Sparkles className="size-4" />}>
                Iḥsān Points
              </OfficeNavLink>
              <OfficeNavLink href="/teacher/messages" icon={<Inbox className="size-4" />}>
                Messages
              </OfficeNavLink>
            </NavGroup>
          </nav>
        </aside>

        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
