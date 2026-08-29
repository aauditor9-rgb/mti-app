import { SalahLogForm } from "@/components/pupil/salah-log-form";
import { todayLondon } from "@/lib/derive/age";
import { getCurrentPupilFromCookie, getMadrasah, getSalahLogForPupilDate } from "@/lib/db/queries";

export default async function PupilMuhasabahPage() {
  const madrasah = await getMadrasah();
  const pupil = await getCurrentPupilFromCookie(madrasah.id);
  if (!pupil) return null;

  const today = todayLondon();
  const existing = await getSalahLogForPupilDate(pupil.id, today);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Self-accountability</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Muḥāsabah</h1>
        <p className="text-small text-[var(--muted)]">Tick off each ṣalāh as you pray it today.</p>
      </div>

      <SalahLogForm pupilId={pupil.id} date={today} existing={existing.map((e) => ({ prayer: e.prayer, prayed: e.prayed, jamaah: e.jamaah }))} />
    </div>
  );
}
