import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";
import { RepairsPanel } from "@/components/AccountPanels";

export const metadata: Metadata = { title: "Repairs" };

export default function RepairsPage() {
  return (
    <AccountShell title="In for mending">
      <RepairsPanel />
    </AccountShell>
  );
}
