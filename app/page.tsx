import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background p-6 text-center text-foreground">
      <h1 className="font-heading text-h1 font-medium">MTI Maktab</h1>
      <p className="w-full max-w-md text-body text-[var(--ink-2)]">
        Scaffold running — Next.js, Tailwind, shadcn/ui and the design tokens from{" "}
        <code>design/README.md</code> are wired up.
      </p>
      <div className="flex gap-2">
        <Button render={<Link href="/students">Students</Link>} nativeButton={false} />
        <Button
          render={<Link href="/classes">Classes &amp; Allocation</Link>}
          nativeButton={false}
          variant="outline"
        />
      </div>
    </div>
  );
}
