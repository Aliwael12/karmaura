import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";
import { OrdersPanel } from "@/components/AccountPanels";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <AccountShell title="Everything you have ordered">
      <OrdersPanel />
    </AccountShell>
  );
}
