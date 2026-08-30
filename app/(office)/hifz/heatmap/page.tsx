import { HubTabs } from "@/components/office/hub-tabs";
import { computeJuzStatuses, type JuzStatus } from "@/lib/derive/hifz";
import { HIFZ_PROGRAMME_TABS } from "@/lib/office-hubs";
import { getHifzRosterMadrasah, getMadrasah } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<JuzStatus, string> = {
  unmemorised: "bg-[var(--surface-2)]",
  untested: "bg-[var(--border-2)]",
  weak: "bg-[var(--alert-bg)]",
  urgent: "bg-[var(--warn-bg)]",
  solid: "bg-[var(--success)]",
};

const STATUS_LABEL: Record<JuzStatus, string> = {
  unmemorised: "Unmemorised",
  untested: "Untested",
  weak: "Weak",
  urgent: "Needs dawr",
  solid: "Solid",
};

export default async function HifzHeatmapPage() {
  const madrasah = await getMadrasah();
  const roster = await getHifzRosterMadrasah(madrasah.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <HubTabs tabs={HIFZ_PROGRAMME_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning · Hifz Programme</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Qur&apos;an Heat Map</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-[var(--surface)] p-3">
        <div className="mb-3 flex flex-wrap gap-3 text-tiny text-[var(--muted)]">
          {(Object.keys(STATUS_LABEL) as JuzStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-sm", STATUS_STYLE[s])} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
        <table className="w-full text-left text-tiny">
          <thead>
            <tr>
              <th className="p-1">Student</th>
              {Array.from({ length: 30 }, (_, i) => (
                <th key={i} className="p-0.5 text-center font-normal text-[var(--muted)]">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map(({ pupil, records }) => {
              const statuses = computeJuzStatuses(records);
              return (
                <tr key={pupil.id}>
                  <td className="whitespace-nowrap p-1 font-medium text-[var(--ink)]">{pupil.name}</td>
                  {Array.from({ length: 30 }, (_, i) => (
                    <td key={i} className="p-0.5">
                      <span title={STATUS_LABEL[statuses[i + 1]]} className={cn("block size-4 rounded-sm", STATUS_STYLE[statuses[i + 1]])} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
