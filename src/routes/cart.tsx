import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, updateQty, updateDays, removeItem, cartTotals } from "@/lib/cart";
import { PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — N.B.R Tools" },
      {
        name: "description",
        content: "Review your rental and purchase items before checkout at N.B.R Tools.",
      },
      { property: "og:title", content: "Your Cart — N.B.R Tools" },
      {
        property: "og:description",
        content: "Review your rental and purchase items before checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const totals = cartTotals(items);

  return (
    <>
      <Header />
      <main className="container-page py-10 min-h-[60vh]">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Your cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length === 0
            ? "Nothing here yet."
            : `${items.length} item${items.length > 1 ? "s" : ""}`}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Browse our {PRODUCTS.length} tools and add what you need on site.
            </p>
            <Button asChild className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((i) => {
                const line = i.unitPrice * i.qty * (i.mode === "rent" ? i.days : 1);
                return (
                  <div
                    key={`${i.id}-${i.mode}`}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <Link
                      to="/product/$slug"
                      params={{ slug: i.slug }}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary/50"
                    >
                      <img
                        src={i.image}
                        alt={i.name}
                        className="h-full w-full object-contain p-2"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {i.brand}
                      </div>
                      <Link
                        to="/product/$slug"
                        params={{ slug: i.slug }}
                        className="mt-0.5 block font-medium leading-snug hover:text-amber line-clamp-2"
                      >
                        {i.name}
                      </Link>
                      <div className="mt-1 text-xs">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${i.mode === "rent" ? "bg-amber/15 text-amber" : "bg-ink text-ink-foreground"}`}
                        >
                          {i.mode === "rent"
                            ? `Rental · ${i.days} day${i.days > 1 ? "s" : ""}`
                            : "Purchase"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQty(i.id, i.mode, i.qty - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQty(i.id, i.mode, i.qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {i.mode === "rent" && (
                            <input
                              type="number"
                              min={1}
                              value={i.days}
                              onChange={(e) =>
                                updateDays(i.id, i.mode, parseInt(e.target.value || "1", 10))
                              }
                              className="ml-2 h-8 w-16 rounded-md border border-border bg-background px-2 text-sm"
                              aria-label="Days"
                            />
                          )}
                          {i.mode === "rent" && (
                            <span className="text-xs text-muted-foreground">days</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-bold">
                            ₹{line.toLocaleString("en-IN")}
                          </div>
                          <button
                            onClick={() => {
                              removeItem(i.id, i.mode);
                              toast("Removed from cart");
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-bold">Order summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={`₹${totals.subtotal.toLocaleString("en-IN")}`} />
                  <Row label="GST (18%)" value={`₹${totals.gst.toLocaleString("en-IN")}`} />
                  <Row label="Delivery" value={`₹${totals.delivery}`} />
                  <Row
                    label="Refundable deposits"
                    value={`₹${totals.deposits.toLocaleString("en-IN")}`}
                    muted
                  />
                </dl>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold">Total payable</span>
                  <span className="font-display text-2xl font-bold">
                    ₹{totals.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="mt-5 w-full bg-amber text-amber-foreground hover:bg-amber/90 font-semibold"
                >
                  <Link to="/checkout">
                    Checkout <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-amber" /> Delivery across Coimbatore area
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber" /> Deposit refunded within 3
                    business days
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <dt>{label}</dt>
      <dd className={muted ? "" : "font-medium"}>{value}</dd>
    </div>
  );
}
