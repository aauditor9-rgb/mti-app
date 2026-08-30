import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HubTabs } from "@/components/office/hub-tabs";
import { ageFromDob } from "@/lib/derive/age";
import { householdLabel } from "@/lib/derive/household-label";
import { getMadrasah, listPupils } from "@/lib/db/queries";
import { STUDENTS_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { key: "onroll", label: "On roll" },
  { key: "archived", label: "Archived" },
] as const;

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/students?${qs}` : "/students";
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; class?: string }>;
}) {
  const { q = "", status = "onroll", class: classFilter = "all" } = await searchParams;

  const madrasah = await getMadrasah();
  const pupils = await listPupils(madrasah.id);

  // "On roll" and "Archived" partition every pupil into exactly one tab — there is no
  // third bucket in the UI, so a mid-term "Left" pupil still counts as on roll until
  // the office archives the record.
  const onRollCount = pupils.filter((p) => p.enrolmentState !== "Archived").length;
  const archivedCount = pupils.filter((p) => p.enrolmentState === "Archived").length;

  const classNames = [...new Set(pupils.map((p) => p.class?.name).filter((n): n is string => !!n))].sort();

  let filtered = pupils.filter((p) =>
    status === "archived" ? p.enrolmentState === "Archived" : p.enrolmentState !== "Archived",
  );
  if (classFilter !== "all") {
    filtered = filtered.filter((p) => p.class?.name === classFilter);
  }
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const guardianNames = p.household?.guardians.map((g) => g.name).join(" ") ?? "";
      return (
        p.name.toLowerCase().includes(needle) ||
        guardianNames.toLowerCase().includes(needle) ||
        (p.class?.name ?? "").toLowerCase().includes(needle)
      );
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <HubTabs tabs={STUDENTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Students</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Student Records</h1>
      </div>

      <form className="flex items-center gap-2" action="/students">
        {status !== "onroll" && <input type="hidden" name="status" value={status} />}
        {classFilter !== "all" && <input type="hidden" name="class" value={classFilter} />}
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, guardian or class…"
          className="max-w-sm bg-[var(--surface)]"
        />
      </form>

      <div className="flex items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={buildHref({ q, status: tab.key === "onroll" ? undefined : tab.key, class: classFilter })}
            className={cn(
              "rounded-full border px-3 py-1 text-small font-medium",
              status === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
            )}
          >
            {tab.label} · {tab.key === "onroll" ? onRollCount : archivedCount}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ q, status: status === "onroll" ? undefined : status, class: undefined })}
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            classFilter === "all" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
          )}
        >
          All classes
        </Link>
        {classNames.map((name) => (
          <Link
            key={name}
            href={buildHref({ q, status: status === "onroll" ? undefined : status, class: name })}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              classFilter === name ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {name}
          </Link>
        ))}
      </div>

      <p className="text-small text-[var(--muted)]">{filtered.length} students</p>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2.5">ID</th>
              <th className="px-4 py-2.5">Student</th>
              <th className="px-4 py-2.5">Boy / Girl</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Age</th>
              <th className="px-4 py-2.5">Household</th>
              <th className="px-4 py-2.5">On roll</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                  No students match this search.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-[var(--muted)]">{p.displayId}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/students/${p.displayId}`} className="font-medium text-[var(--primary)] hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className="uppercase">
                      {p.gender === "M" ? "Boy" : "Girl"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">{p.class?.name ?? "Unallocated"}</td>
                  <td className="px-4 py-2.5">{ageFromDob(p.dob)}</td>
                  <td className="px-4 py-2.5">{householdLabel(p.household?.guardians ?? [])}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-tiny font-medium",
                        p.enrolmentState === "Enrolled" && "bg-[var(--success-bg)] text-[var(--success)]",
                        p.enrolmentState === "Left" && "bg-[var(--warn-bg)] text-[var(--ink-2)]",
                        p.enrolmentState === "Archived" && "bg-[var(--surface-2)] text-[var(--muted)]",
                      )}
                    >
                      {p.enrolmentState}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
