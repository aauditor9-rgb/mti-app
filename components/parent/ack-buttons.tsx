"use client";

import { useTransition } from "react";
import { acknowledgePolicyAsGuardian, signDocument } from "@/app/parent/fees/actions";
import { cn } from "@/lib/utils";

export function SignDocumentButton({ documentId, signed }: { documentId: string; signed: boolean }) {
  const [pending, startTransition] = useTransition();
  if (signed) return <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--success)]">Signed</span>;
  return (
    <button
      onClick={() => startTransition(async () => { await signDocument(documentId); })}
      disabled={pending}
      className="rounded-full bg-[var(--warn-bg)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)] hover:bg-border disabled:opacity-50"
    >
      Review &amp; sign
    </button>
  );
}

export function AckPolicyButton({ policyId, acknowledged }: { policyId: string; acknowledged: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => { await acknowledgePolicyAsGuardian(policyId); })}
      disabled={pending || acknowledged}
      className={cn(
        "rounded-full px-2 py-0.5 text-tiny font-medium disabled:cursor-default",
        acknowledged ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:bg-border",
      )}
    >
      {acknowledged ? "Acknowledged" : "I've read this"}
    </button>
  );
}
