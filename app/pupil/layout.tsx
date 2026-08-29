import { BookOpen, ClipboardCheck, Moon, Sparkles, Star } from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { PasscodePad } from "@/components/pupil/passcode-pad";
import { getCurrentPupilFromCookie, getMadrasah } from "@/lib/db/queries";
import { getPendingPupilId } from "@/lib/session";
import { backToParent } from "./session-actions";

export default async function PupilLayout({ children }: { children: React.ReactNode }) {
  const madrasah = await getMadrasah();
  const currentPupil = await getCurrentPupilFromCookie(madrasah.id);

  if (!currentPupil) {
    const pending = await getPendingPupilId();
    if (!pending) {
      return (
        <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
          <p className="max-w-sm text-center text-small text-[var(--muted)]">
            Ask a parent to hand you the device from the Parent portal.
          </p>
        </div>
      );
    }
    return <PasscodePad />;
  }

  const isHifz = currentPupil.class?.hifdhType && currentPupil.class.hifdhType !== "None";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="flex items-center justify-end gap-3 border-b border-border bg-[var(--surface)] px-6 py-2.5">
        <span className="text-tiny text-[var(--muted)]">{currentPupil.name}</span>
        <form action={backToParent}>
          <button type="submit" className="text-tiny font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline">
            Back to parent
          </button>
        </form>
      </div>
      <div className="flex flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border bg-[var(--surface)] p-4">
          <div className="px-1">
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Student Portal</p>
            <p className="truncate text-small font-medium text-[var(--ink)]">{currentPupil.name}</p>
            <p className="truncate text-tiny text-[var(--muted)]">{currentPupil.class?.name ?? ""}</p>
          </div>

          <nav className="flex flex-col gap-0.5">
            <OfficeNavLink href="/pupil" icon={<BookOpen className="size-4" />}>
              Tonight&apos;s Work
            </OfficeNavLink>
            {isHifz && (
              <OfficeNavLink href="/pupil/hifz" icon={<ClipboardCheck className="size-4" />}>
                My Hifz
              </OfficeNavLink>
            )}
            <OfficeNavLink href="/pupil/muhasabah" icon={<Moon className="size-4" />}>
              Muḥāsabah
            </OfficeNavLink>
            <OfficeNavLink href="/pupil/quiz" icon={<Star className="size-4" />}>
              ʿIlm Quiz
            </OfficeNavLink>
            <OfficeNavLink href="/pupil/ihsan" icon={<Sparkles className="size-4" />}>
              My Ihsan Points
            </OfficeNavLink>
          </nav>

          <p className="px-2.5 text-tiny text-[var(--muted-2)]">Lesson and revision material only — nothing else is shown here.</p>
        </aside>

        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
