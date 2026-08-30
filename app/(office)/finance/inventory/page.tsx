import { AddInventoryItemForm } from "@/components/office/add-inventory-item-form";
import { InventoryRow } from "@/components/office/inventory-row";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listInventoryItems } from "@/lib/db/queries";
import { FINANCE_TABS } from "@/lib/office-hubs";

export default async function InventoryPage() {
  const madrasah = await getMadrasah();
  const items = await listInventoryItems(madrasah.id);
  const belowReorderCount = items.filter((i) => i.stock <= i.reorderLevel).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={FINANCE_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Finance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Books &amp; Inventory</h1>
        <p className="text-small text-[var(--muted)]">
          {belowReorderCount} item{belowReorderCount === 1 ? "" : "s"} at or below reorder level
        </p>
      </div>

      <AddInventoryItemForm />

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2.5">Item</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Issued unpaid</th>
              <th className="px-4 py-2.5">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                  No items in the catalog yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <InventoryRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  stock={item.stock}
                  reorderLevel={item.reorderLevel}
                  price={item.price}
                  issuedUnpaidCount={item.issuedUnpaidCount}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
