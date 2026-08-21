import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";
import { SavedPanel } from "@/components/AccountPanels";

export const metadata: Metadata = { title: "Saved pieces" };

export default function SavedPage() {
  return (
    <AccountShell title="Pieces you have kept">
      <SavedPanel />
    </AccountShell>
  );
}
