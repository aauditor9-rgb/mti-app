import { HubTabs } from "@/components/office/hub-tabs";
import { REPORTS_TABS } from "@/lib/office-hubs";
import { getAttendanceTrend, getMadrasah, listConcerns, listHomework, listIhsanTotals } from "@/lib/db/queries";

// listIhsanTotals recomputes automatic awards from every attendance_mark row in memory
// on every call, with no caching — cheap at request time but has repeatedly timed out
// Next's build-time static generation attempt (both locally and on Vercel). This page
// is per-tenant live data anyway and should never be a cached, build-time snapshot.
export const dynamic = "force-dynamic";

export default async function WeeklyReviewPage() {
  const madrasah = await getMadrasah();
  const [trend, concerns, homework, ihsanTotals] = await Promise.all([
    getAttendanceTrend(madrasah.id),
    listConcerns(madrasah.id),
    listHomework(madrasah.id),
    listIhsanTotals(madrasah.id),
  ]);

  const last7 = trend.slice(-7);
  const avgAttendance = last7.length === 0 ? 0 : Math.round(last7.reduce((s, d) => s + d.pct, 0) / last7.length);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const concernsThisWeek = concerns.filter((c) => c.createdAt.toISOString().slice(0, 10) >= weekStartStr).length;
  const homeworkOutThisWeek = homework.filter((h) => h.createdAt.toISOString().slice(0, 10) >= weekStartStr).length;
  const pointsThisWeek = ihsanTotals.reduce(
    (sum, p) => sum + p.manualRows.filter((r) => r.awardedAt.toISOString().slice(0, 10) >= weekStartStr).reduce((s, r) => s + r.award.points, 0),
    0,
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={REPORTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Weekly Review</h1>
        <p className="text-small text-[var(--muted)]">The last 7 days, at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{avgAttendance}%</p>
          <p className="text-small text-[var(--muted)]">Avg. attendance</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{concernsThisWeek}</p>
          <p className="text-small text-[var(--muted)]">Concerns logged</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{homeworkOutThisWeek}</p>
          <p className="text-small text-[var(--muted)]">Homework set</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{pointsThisWeek}</p>
          <p className="text-small text-[var(--muted)]">Iḥsān points awarded</p>
        </div>
      </div>
    </div>
  );
}
