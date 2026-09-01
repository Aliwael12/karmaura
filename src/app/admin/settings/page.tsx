import { requireAdmin } from "@/lib/db/auth";
import { getSettings } from "@/lib/db/settings";
import { PageHead, Panel } from "../ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <PageHead eyebrow="Settings" title="The knobs worth turning" />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <SettingsForm settings={settings} />

        <Panel title="What these do">
          <div className="flex flex-col gap-4 text-[13px] leading-[1.7] text-cream/55">
            <p>
              <span className="text-cream/85">Delivery fee</span> is charged on
              every order below the threshold. Payment is cash on delivery, so
              this is what the courier collects on top of the pieces.
            </p>
            <p>
              <span className="text-cream/85">Free delivery from</span> is the
              subtotal at which the fee drops to nothing. Both are read by the
              database when an order is priced, so a change here applies to the
              very next checkout — no deploy needed.
            </p>
            <p>
              <span className="text-cream/85">Announcement</span> shows as a
              strip above the header when it is not empty. Leave it blank for
              no strip.
            </p>
            <p>
              <span className="text-cream/85">Closed for orders</span> keeps the
              shop browsable but stops checkout — for a holiday, or when the
              atelier is behind.
            </p>
            <p className="border-t border-gold/15 pt-4 text-cream/40">
              The atelier details below aren&apos;t shown on the storefront
              right now — the Visit page was removed.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
