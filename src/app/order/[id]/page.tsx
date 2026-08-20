import type { Metadata } from "next";
import OrderScreen from "@/components/OrderScreen";

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
  return <OrderScreen id={id} />;
}
