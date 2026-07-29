import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  Star, ShieldCheck, Truck, Clock, ChevronRight, Check,
  Heart, Share2, Minus, Plus, ShoppingCart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — N.B.R Tools" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Rent from ₹${p.rentalPerDay}/day | N.B.R Tools` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — N.B.R Tools` },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

const DURATIONS = [
  { id: "day", label: "1 Day", mult: 1, days: 1 },
  { id: "3day", label: "3 Days", mult: 3 * 0.95, days: 3 },
  { id: "week", label: "1 Week", mult: 7 * 0.9, days: 7 },
  { id: "month", label: "1 Month", mult: 30 * 0.75, days: 30 },
];

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const [duration, setDuration] = useState("day");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const durInfo = DURATIONS.find((d) => d.id === duration) ?? DURATIONS[0];
  const rentalCost = Math.round(p.rentalPerDay * durInfo.mult * qty);
  const gst = Math.round(rentalCost * 0.18);
  const delivery = 199;
  const total = rentalCost + gst + delivery;

  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const onRent = () => {
    addToCart(p, { mode: "rent", qty, days: durInfo.days });
    toast.success(`${p.name} added — ${durInfo.label}`);
  };
  const onBuy = () => {
    addToCart(p, { mode: "buy", qty });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <>
      <Header />
      <main className="container-page py-6 overflow-x-hidden">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{p.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_340px]">
          {/* Gallery */}
          <div className="lg:col-span-1 min-w-0">
            <div className="lg:sticky lg:top-24">
              <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-secondary/40">
                <img
                  src={p.images[activeImg] ?? p.image}
                  alt={`${p.name} — view ${activeImg + 1}`}
                  width={900}
                  height={900}
                  className="h-full w-full object-contain p-6 transition-opacity"
                />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {p.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`aspect-square overflow-hidden rounded-lg border bg-secondary/40 transition-colors ${activeImg === i ? "border-amber ring-2 ring-amber/30" : "border-border hover:border-amber/60"}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-amber font-medium">{p.brand}</div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight break-words">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber text-amber" />
                <span className="font-semibold">{p.rating}</span>
                <span className="text-muted-foreground">({p.reviews} reviews)</span>
              </div>
              <span className={`font-medium ${p.stock > 5 ? "text-success" : "text-destructive"}`}>
                {p.stock > 5 ? "In stock" : `Only ${p.stock} left`}
              </span>
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">{p.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { i: Truck, t: "Free delivery", s: "Above ₹5,000" },
                { i: ShieldCheck, t: "Insured", s: "Zero liability" },
                { i: Clock, t: "24/7 support", s: "On-site help" },
              ].map(({ i: I, t, s }) => (
                <div key={t} className="rounded-xl border border-border bg-card p-3 text-center">
                  <I className="mx-auto h-5 w-5 text-amber" />
                  <div className="mt-1.5 text-xs font-semibold">{t}</div>
                  <div className="text-[11px] text-muted-foreground">{s}</div>
                </div>
              ))}
            </div>

            <Tabs defaultValue="specs" className="mt-8">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="policy">Policy</TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="mt-4">
                <dl className="divide-y divide-border rounded-xl border border-border bg-card">
                  {(Object.entries(p.specs) as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
              <TabsContent value="terms" className="mt-4 rounded-xl border border-border bg-card p-5 text-sm space-y-2 text-muted-foreground">
                <p>• Refundable security deposit: <span className="text-foreground font-medium">₹{p.deposit.toLocaleString("en-IN")}</span></p>
                <p>• Late return charge: 25% of daily rate per hour</p>
                <p>• Free cancellation up to 12 hours before pickup</p>
                <p>• Damage assessed at return; deposit refund within 3 business days</p>
              </TabsContent>
              <TabsContent value="safety" className="mt-4 rounded-xl border border-border bg-card p-5 text-sm space-y-2 text-muted-foreground">
                {["Wear PPE at all times", "Inspect equipment before each use", "Follow manufacturer's guidelines", "Report damage or malfunctions immediately"].map((s) => (
                  <p key={s} className="flex gap-2"><Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> {s}</p>
                ))}
              </TabsContent>
              <TabsContent value="policy" className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                <p>Full rental agreement provided at checkout. GST invoice included with every order. Digital signature required on delivery.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking sidebar */}
          <aside className="min-w-0">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-5 shadow-elegant">
              <div className="flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold">₹{p.rentalPerDay.toLocaleString("en-IN")}</div>
                <div className="text-sm text-muted-foreground">/ day</div>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">or buy at ₹{p.salePrice.toLocaleString("en-IN")}</div>

              <div className="mt-5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Rental duration</Label>
                <RadioGroup value={duration} onValueChange={setDuration} className="mt-2 grid grid-cols-2 gap-2">
                  {DURATIONS.map((d) => (
                    <label
                      key={d.id}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all ${
                        duration === d.id ? "border-amber bg-amber/10 font-semibold" : "border-border hover:border-amber/50"
                      }`}
                    >
                      <RadioGroupItem value={d.id} className="sr-only" />
                      {d.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="mt-4">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Quantity</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus className="h-4 w-4" /></Button>
                  <span className="text-xs text-muted-foreground ml-auto">{p.stock} avail</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5 text-sm border-t border-border pt-4">
                <Row label="Rental cost" value={`₹${rentalCost.toLocaleString("en-IN")}`} />
                <Row label="GST (18%)" value={`₹${gst.toLocaleString("en-IN")}`} />
                <Row label="Delivery" value={`₹${delivery}`} />
                <Row label="Deposit (refundable)" value={`₹${p.deposit.toLocaleString("en-IN")}`} muted />
                <div className="flex justify-between pt-2 mt-2 border-t border-border">
                  <span className="font-semibold">Total payable</span>
                  <span className="font-display text-xl font-bold">₹{(total + p.deposit).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button size="lg" onClick={onRent} className="mt-5 w-full bg-amber text-amber-foreground hover:bg-amber/90 font-semibold">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart · Rent
              </Button>
              <Button size="lg" variant="outline" onClick={onBuy} className="mt-2 w-full">
                Buy for ₹{p.salePrice.toLocaleString("en-IN")}
              </Button>

              <div className="mt-4 flex gap-2 justify-center text-xs text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground"><Heart className="h-3.5 w-3.5" /> Save</button>
                <span>·</span>
                <button className="flex items-center gap-1 hover:text-foreground"><Share2 className="h-3.5 w-3.5" /> Share</button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className={muted ? "" : "font-medium"}>{value}</span>
    </div>
  );
}
