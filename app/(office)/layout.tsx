import {
  AlertTriangle,
  Banknote,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Clock,
  Contact,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  IdCard,
  Inbox,
  Layers,
  LayoutDashboard,
  ListTodo,
  MessageCircleWarning,
  Moon,
  Package,
  PartyPopper,
  Receipt,
  ScrollText,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { ClipboardCheck, FileSignature, UserCheck } from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { getMadrasah } from "@/lib/db/queries";

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
              Overview
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/" icon={<LayoutDashboard className="size-4" />}>
                Dashboard
              </OfficeNavLink>
              <OfficeNavLink href="/calendar" icon={<Calendar className="size-4" />}>
                Calendar
              </OfficeNavLink>
              <OfficeNavLink href="/tasks" icon={<ListTodo className="size-4" />}>
                Tasks
              </OfficeNavLink>
            </div>
          </div>

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
              <OfficeNavLink href="/admissions" icon={<ClipboardList className="size-4" />}>
                Admissions
              </OfficeNavLink>
              <OfficeNavLink href="/staff/directory" icon={<Contact className="size-4" />}>
                Teacher Database
              </OfficeNavLink>
              <OfficeNavLink href="/staff/clock" icon={<Clock className="size-4" />}>
                Clock In/Out
              </OfficeNavLink>
              <OfficeNavLink href="/staff/payroll" icon={<Banknote className="size-4" />}>
                Payroll
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
              <OfficeNavLink href="/attendance/leave-requests" icon={<ClipboardCheck className="size-4" />}>
                Leave Requests
              </OfficeNavLink>
              <OfficeNavLink href="/ihsan" icon={<Sparkles className="size-4" />}>
                Iḥsān Points
              </OfficeNavLink>
              <OfficeNavLink href="/concerns" icon={<HeartHandshake className="size-4" />}>
                Concerns
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Teaching &amp; Learning
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/lesson-plans" icon={<CalendarDays className="size-4" />}>
                Lesson Plans
              </OfficeNavLink>
              <OfficeNavLink href="/homework" icon={<BookOpen className="size-4" />}>
                Homework
              </OfficeNavLink>
              <OfficeNavLink href="/salah" icon={<Moon className="size-4" />}>
                Ṣalāh &amp; Tarbiyah
              </OfficeNavLink>
              <OfficeNavLink href="/progress-trackers/duas" icon={<BookMarked className="size-4" />}>
                Du&apos;as Tracker
              </OfficeNavLink>
              <OfficeNavLink href="/progress-trackers/surahs" icon={<ScrollText className="size-4" />}>
                Surahs Tracker
              </OfficeNavLink>
              <OfficeNavLink href="/progress-trackers/safar-qaaidah" icon={<Layers className="size-4" />}>
                Safar Qaaidah Tracker
              </OfficeNavLink>
              <OfficeNavLink href="/progress-trackers/knowledge-passport" icon={<IdCard className="size-4" />}>
                Knowledge Passport
              </OfficeNavLink>
              <OfficeNavLink href="/hifz" icon={<Moon className="size-4" />}>
                Hifz Programme
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Finance
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/finance/fees" icon={<Receipt className="size-4" />}>
                Fees
              </OfficeNavLink>
              <OfficeNavLink href="/finance/inventory" icon={<Package className="size-4" />}>
                Books &amp; Inventory
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Communications
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/communications/messages" icon={<Inbox className="size-4" />}>
                Messages
              </OfficeNavLink>
              <OfficeNavLink href="/communications/events" icon={<PartyPopper className="size-4" />}>
                Events &amp; Jalsas
              </OfficeNavLink>
              <OfficeNavLink href="/communications/parents-evening" icon={<UserCheck className="size-4" />}>
                Parents&apos; Evening
              </OfficeNavLink>
              <OfficeNavLink href="/communications/forms" icon={<FileCheck2 className="size-4" />}>
                Forms &amp; Consent
              </OfficeNavLink>
              <OfficeNavLink href="/communications/documents" icon={<FileSignature className="size-4" />}>
                Documents
              </OfficeNavLink>
              <OfficeNavLink href="/communications/complaints" icon={<MessageCircleWarning className="size-4" />}>
                Complaints
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Safeguarding
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/safeguarding/medical" icon={<Stethoscope className="size-4" />}>
                Medical Register
              </OfficeNavLink>
              <OfficeNavLink href="/safeguarding/risk-register" icon={<AlertTriangle className="size-4" />}>
                Risk Register
              </OfficeNavLink>
              <OfficeNavLink href="/safeguarding/policies" icon={<ShieldCheck className="size-4" />}>
                Policy Acknowledgements
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Settings
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/settings/school" icon={<SettingsIcon className="size-4" />}>
                School
              </OfficeNavLink>
            </div>
          </div>

          <div>
            <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Reports &amp; Assessment
            </p>
            <div className="flex flex-col gap-0.5">
              <OfficeNavLink href="/reports" icon={<GraduationCap className="size-4" />}>
                Reports
              </OfficeNavLink>
              <OfficeNavLink href="/examinations" icon={<ClipboardList className="size-4" />}>
                Examinations
              </OfficeNavLink>
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
