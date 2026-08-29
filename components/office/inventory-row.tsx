"use client";

import { useTransition } from "react";
import { adjustStock } from "@/app/(office)/finance/inventory/actions";
import { cn } from "@/lib/utils";

export function InventoryRow({
  id,
  name,
  category,
  stock,
  reorderLevel,
  price,
  issuedUnpaidCount,
}: {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: string;
  issuedUnpaidCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const belowReorder = stock <= reorderLevel;

  function adjust(delta: number) {
    startTransition(async () => {
      await adjustStock(id, delta);
    });
  }

  return (
    <tr className={cn("border-t border-border", pending && "opacity-70")}>
      <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{name}</td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">{category}</td>
      <td className="px-4 py-2.5">
        <span className={cn(belowReorder ? "font-medium text-[var(--alert)]" : "text-[var(--ink)]")}>
          {stock} {belowReorder ? "- reorder" : "in stock"}
        </span>
      </td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">£{Number(price).toFixed(2)}</td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">{issuedUnpaidCount > 0 ? `${issuedUnpaidCount} issued unpaid` : "-"}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => adjust(-1)} disabled={pending || stock === 0} className="size-6 rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] disabled:opacity-40">
            −
          </button>
          <button onClick={() => adjust(1)} disabled={pending} className="size-6 rounded-full bg-[var(--surface-2)] text-[var(--ink-2)]">
            +
          </button>
        </div>
      </td>
    </tr>
  );
}
