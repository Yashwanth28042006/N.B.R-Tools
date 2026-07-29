import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { listOrders, deliveryStage, type Order, type DeliveryStage } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, Truck, CheckCircle2 } from "lucide-react";

const searchSchema = z.object({
  placed: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/orders")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [{ title: "Your Orders — N.B.R Tools" }],
  }),
  component: OrdersPage,
});

const METHOD_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};

const STAGES: Array<{ key: DeliveryStage; label: string }> = [
  { key: "processing", label: "Processing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function DeliveryTracker({ createdAt }: { createdAt: string }) {
  const stage = deliveryStage(createdAt);
  const activeIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {STAGES.map((s, i) => {
        const done = i <= activeIndex;
        const Icon =
          s.key === "processing" ? Package : s.key === "out_for_delivery" ? Truck : CheckCircle2;
        return (
          <div key={s.key} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${
                done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 w-4 sm:w-8 ${i < activeIndex ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrdersPage() {
  const { placed } = Route.useSearch();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const hasSession = Boolean(data.session?.user);
      setSignedIn(hasSession);
      if (hasSession) listOrders().then(setOrders);
    });
  }, []);

  // Re-render periodically so the simulated delivery stage progresses live
  // without needing a manual page refresh.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Header />
      <main className="container-page py-10 min-h-[60vh]">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Your orders</h1>

        {signedIn === false ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Sign in to view your order history.</p>
            <Button asChild className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/account">Sign in</Link>
            </Button>
          </div>
        ) : orders === null ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl border bg-card p-5 ${
                  order.id === placed ? "border-amber shadow-elegant" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber" />
                    <div>
                      <div className="text-sm font-semibold">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
                        {METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                      </div>
                    </div>
                  </div>
                  <DeliveryTracker createdAt={order.createdAt} />
                </div>
                {deliveryStage(order.createdAt) === "delivered" && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" /> Your order has been delivered.
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => {
                    const product = getProductById(item.productId);
                    const line = item.unitPrice * item.qty * (item.mode === "rent" ? item.days : 1);
                    const thumb = (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-lg bg-secondary/50 object-contain p-1.5"
                      />
                    );
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        {product ? (
                          <Link to="/product/$slug" params={{ slug: product.slug }}>
                            {thumb}
                          </Link>
                        ) : (
                          thumb
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {item.brand}
                          </div>
                          {product ? (
                            <Link
                              to="/product/$slug"
                              params={{ slug: product.slug }}
                              className="block truncate font-medium hover:text-amber"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <div className="truncate font-medium">{item.name}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Qty {item.qty}
                            {item.mode === "rent"
                              ? ` · ${item.days} day${item.days > 1 ? "s" : ""}`
                              : " · Purchase"}
                          </div>
                        </div>
                        <div className="font-display font-bold">
                          ₹{line.toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold">Total paid</span>
                  <span className="font-display text-xl font-bold">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
