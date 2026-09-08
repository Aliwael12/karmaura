import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderScreen from "@/components/OrderScreen";
import { getOrderForViewer } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  description: "Thank you — it is on its way.",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderForViewer(id);
  if (!order) notFound();
  return <OrderScreen order={order} />;
}
