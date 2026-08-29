"use client";

import { useRef, useState, useTransition } from "react";
import { addInventoryItem } from "@/app/(office)/finance/inventory/actions";
import { inventoryCategoryEnum } from "@/lib/db/schema";

export function AddInventoryItemForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addInventoryItem(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add the item.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + Add item
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <label className="flex flex-1 min-w-40 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Item name</span>
        <input name="name" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Category</span>
        <select name="category" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
          {inventoryCategoryEnum.enumValues.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-24 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Stock</span>
        <input type="number" name="stock" min={0} defaultValue={0} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>
      <label className="flex w-24 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reorder at</span>
        <input type="number" name="reorderLevel" min={0} defaultValue={0} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>
      <label className="flex w-24 flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Price (£)</span>
        <input type="number" name="price" min="0" step="0.01" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
        Cancel
      </button>
      {error && <p className="w-full text-small text-[var(--alert)]">{error}</p>}
    </form>
  );
}
