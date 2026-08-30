import Link from "next/link";
import { BookOpen, ClipboardList, Inbox, Receipt, Sparkles, User } from "lucide-react";
import { OfficeNavLink } from "@/components/office/office-nav-link";
import { PortalTopbar } from "@/components/shared/portal-topbar";
import { NavGroup } from "@/components/shared/nav-group";
import { getCurrentGuardian, getMadrasah } from "@/lib/db/queries";
import { signOut } from "@/app/sign-in/actions";
import { handToPupil } from "./hand-to-actions";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const madrasah = await getMadrasah();
  const currentGuardian = await getCurrentGuardian(madrasah.id);

  if (!currentGuardian) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
        <PortalTopbar onLogOut={signOut} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="max-w-sm rounded-xl border border-border bg-[var(--surface)] p-6 text-center text-small text-[var(--muted)]">
            This account isn&apos;t linked to a guardian record. Ask the office to grant
            access, or sign in with a different account.
          </p>
        </div>
      </div>
    );
  }

  const children_ = currentGuardian.children;
  const firstChild = children_[0];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <PortalTopbar viewerName={currentGuardian.name} onLogOut={signOut} />
      <div className="flex flex-1">
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border bg-[var(--surface)] p-4">
          <div className="px-1">
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Parent Portal</p>
            <p className="truncate text-small font-medium text-[var(--ink)]">{currentGuardian.name}</p>
          </div>

          {firstChild && (
            <form action={handToPupil.bind(null, firstChild.id)}>
              <button
                type="submit"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-center text-tiny font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              >
                Hand to {firstChild.name.split(" ")[0]}
              </button>
            </form>
          )}

          <nav className="flex flex-col gap-3">
            <NavGroup title="My Child" hrefs={["/parent", "/parent/learning", "/parent/memorisation", "/parent/ihsan"]}>
              {firstChild && (
                <OfficeNavLink href="/parent" icon={<User className="size-4" />}>
                  {firstChild.name.split(" ")[0]}
                </OfficeNavLink>
              )}
              <OfficeNavLink href="/parent/learning" icon={<BookOpen className="size-4" />}>
                Learning
              </OfficeNavLink>
              <OfficeNavLink href="/parent/memorisation" icon={<ClipboardList className="size-4" />}>
                Memorisation
              </OfficeNavLink>
              <OfficeNavLink href="/parent/ihsan" icon={<Sparkles className="size-4" />}>
                Iḥsān Points
              </OfficeNavLink>
            </NavGroup>

            <NavGroup title="School" hrefs={["/parent/requests", "/parent/fees", "/parent/messages"]}>
              <OfficeNavLink href="/parent/requests" icon={<ClipboardList className="size-4" />}>
                Requests
              </OfficeNavLink>
              <OfficeNavLink href="/parent/fees" icon={<Receipt className="size-4" />}>
                Fees &amp; documents
              </OfficeNavLink>
              <OfficeNavLink href="/parent/messages" icon={<Inbox className="size-4" />}>
                Messages &amp; calendar
              </OfficeNavLink>
            </NavGroup>
          </nav>

          {children_.length > 1 && (
            <div>
              <p className="px-2.5 pb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Switch child</p>
              <div className="flex flex-col gap-0.5">
                {children_.map((c) => (
                  <Link
                    key={c.id}
                    href={`/parent?child=${c.id}`}
                    className="rounded-lg px-2.5 py-1.5 text-small text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
