import { requireAdmin } from "@/lib/db/auth";
import { getSettings } from "@/lib/db/settings";
import { PageHead } from "../ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <PageHead eyebrow="Settings" title="The knobs worth turning" />

      <div className="max-w-3xl">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
