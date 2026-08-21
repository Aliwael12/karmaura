import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";
import { OverviewPanel } from "@/components/AccountPanels";

export const metadata: Metadata = {
  title: "My profile",
  description: "Your orders, saved pieces, addresses and repairs.",
};

export default function AccountPage() {
  return (
    <AccountShell title="Your home, kept">
      <OverviewPanel />
    </AccountShell>
  );
}
