import type { Metadata } from "next";
import CartScreen from "@/components/CartScreen";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Your bag, delivery and payment.",
};

export default function CartPage() {
  return <CartScreen />;
}
