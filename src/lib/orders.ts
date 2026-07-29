import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "./cart";
import type { cartTotals } from "./cart";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

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

export async function placeOrder(
  items: CartItem[],
  totals: ReturnType<typeof cartTotals>,
  paymentMethod: PaymentMethod,
): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) throw new Error("You must be signed in to place an order.");
  if (!items.length) throw new Error("Your cart is empty.");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      payment_method: paymentMethod,
      status: "paid",
      subtotal: totals.subtotal,
      gst: totals.gst,
      delivery: totals.delivery,
      deposits: totals.deposits,
      total: totals.total,
    })
    .select("id")
    .single();
  if (orderError || !order) throw new Error(orderError?.message ?? "Could not create order.");

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      user_id: userId,
      product_id: item.id,
      name: item.name,
      image: item.image,
      brand: item.brand,
      mode: item.mode,
      qty: item.qty,
      days: item.days,
      unit_price: item.unitPrice,
      deposit: item.deposit,
    })),
  );
  if (itemsError) throw new Error(itemsError.message);

  return order.id as string;
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
