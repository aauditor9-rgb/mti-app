import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ageFromDob } from "@/lib/derive/age";
import { householdLabel } from "@/lib/derive/household-label";
import { getClass, getMadrasah } from "@/lib/db/queries";

export default async function ClassDetailPage(props: PageProps<"/classes/[id]">) {
  const { id } = await props.params;
  const madrasah = await getMadrasah();
  const klass = await getClass(madrasah.id, id);
  if (!klass) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Students</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Classes &amp; Allocation</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/classes"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to classes
        </Link>

        <div className="flex items-center gap-2">
          <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">{klass.name}</h2>
          <Badge variant="secondary">{klass.gender}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teacher</p>
            <p className="text-body text-[var(--ink)]">{klass.leadTeacher?.name ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Timing</p>
            <p className="text-body text-[var(--ink)]">{klass.timing}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Lessons</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {klass.lessons.map((lesson) => (
              <span
                key={lesson}
                className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny text-[var(--ink-2)]"
              >
                {lesson}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            Roster · {klass.pupils.length} student{klass.pupils.length === 1 ? "" : "s"}
          </p>
          {klass.pupils.length === 0 ? (
            <p className="mt-2 text-small text-[var(--muted)]">No students allocated to this class yet.</p>
          ) : (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-small">
                <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Boy / Girl</th>
                    <th className="px-4 py-2.5">Age</th>
                    <th className="px-4 py-2.5">Household</th>
                  </tr>
                </thead>
                <tbody>
                  {klass.pupils.map((p) => (
                    <tr key={p.id} className="border-t border-border">
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
                      <td className="px-4 py-2.5">{ageFromDob(p.dob)}</td>
                      <td className="px-4 py-2.5">{householdLabel(p.household?.guardians ?? [])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
