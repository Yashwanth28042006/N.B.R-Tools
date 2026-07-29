import { supabase } from "@/integrations/supabase/client";
import { placeOrderSecure } from "./order.functions";
import type { CartItem } from "./cart";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export type DeliveryStage = "processing" | "out_for_delivery" | "delivered";

const PROCESSING_MINUTES = 1;
const OUT_FOR_DELIVERY_MINUTES = 3;

// Simulated delivery progress, derived purely from elapsed time since the
// order was placed - there's no dispatch/logistics backend behind this yet.
export function deliveryStage(createdAt: string): DeliveryStage {
  const minutesElapsed = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  if (minutesElapsed < PROCESSING_MINUTES) return "processing";
  if (minutesElapsed < OUT_FOR_DELIVERY_MINUTES) return "out_for_delivery";
  return "delivered";
}

export type Order = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  gst: number;
  delivery: number;
  deposits: number;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    brand: string;
    mode: "rent" | "buy";
    qty: number;
    days: number;
    unitPrice: number;
    deposit: number;
  }>;
};

export async function placeOrder(items: CartItem[], paymentMethod: PaymentMethod): Promise<string> {
  if (!items.length) throw new Error("Your cart is empty.");

  // Only product id/mode/qty/days are sent - the server re-derives every
  // price from the product catalog itself, so a tampered client can't
  // dictate what an order is recorded as costing.
  const { orderId } = await placeOrderSecure({
    data: {
      items: items.map((item) => ({
        productId: item.id,
        mode: item.mode,
        qty: item.qty,
        days: item.days,
      })),
      paymentMethod,
    },
  });
  return orderId;
}

export async function listOrders(): Promise<Order[]> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_method, subtotal, gst, delivery, deposits, total, created_at, order_items(*)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    status: row.status,
    paymentMethod: row.payment_method as PaymentMethod,
    subtotal: row.subtotal,
    gst: row.gst,
    delivery: row.delivery,
    deposits: row.deposits,
    total: row.total,
    createdAt: row.created_at,
    items: row.order_items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      image: item.image,
      brand: item.brand,
      mode: item.mode as "rent" | "buy",
      qty: item.qty,
      days: item.days,
      unitPrice: item.unit_price,
      deposit: item.deposit,
    })),
  }));
}
