import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getProductById } from "./products";
import { cartTotals, type CartItem } from "./cart";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

type OrderItemInput = { productId: string; mode: "rent" | "buy"; qty: number; days: number };

// Prices/totals are re-derived here from the product catalog rather than
// trusted from the client - a tampered client can only choose which
// products/quantities go in, never what they cost or what the order totals
// to. RLS on `orders`/`order_items` only enforces row ownership, not price
// correctness, so that check has to happen in this trusted server path.
export const placeOrderSecure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { items: OrderItemInput[]; paymentMethod: PaymentMethod }) => data)
  .handler(async ({ data, context }) => {
    if (!data.items.length) throw new Error("Your cart is empty.");

    const items: CartItem[] = data.items.flatMap((input) => {
      const product = getProductById(input.productId);
      if (!product || (input.mode !== "rent" && input.mode !== "buy")) return [];
      const qty = Math.max(1, Math.floor(input.qty) || 1);
      const days = Math.max(1, Math.floor(input.days) || 1);
      return [
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          brand: product.brand,
          mode: input.mode,
          qty,
          days,
          unitPrice: input.mode === "rent" ? product.rentalPerDay : product.salePrice,
          deposit: input.mode === "rent" ? product.deposit : 0,
        } satisfies CartItem,
      ];
    });
    if (!items.length) throw new Error("No valid items in cart.");

    const totals = cartTotals(items);

    const { data: order, error: orderError } = await context.supabase
      .from("orders")
      .insert({
        user_id: context.userId,
        payment_method: data.paymentMethod,
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

    const { error: itemsError } = await context.supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id as string,
        user_id: context.userId,
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

    return { orderId: order.id as string };
  });
