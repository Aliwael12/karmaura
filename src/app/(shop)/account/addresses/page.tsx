import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";
import { AddressesPanel } from "@/components/AccountPanels";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <AccountShell title="Where things go">
      <AddressesPanel />
    </AccountShell>
  );
}
