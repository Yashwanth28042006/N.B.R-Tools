import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, cartTotals } from "@/lib/cart";
import { placeOrder, type PaymentMethod } from "@/lib/orders";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Smartphone, CreditCard, Landmark, Banknote, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — N.B.R Tools" }],
  }),
  component: CheckoutPage,
});

const METHODS: Array<{ value: PaymentMethod; label: string; icon: typeof Smartphone }> = [
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "netbanking", label: "Net Banking", icon: Landmark },
  { value: "cod", label: "Cash on Delivery", icon: Banknote },
];

function CheckoutPage() {
  const items = useCart();
  const totals = cartTotals(items);
  const navigate = useNavigate();

  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session?.user)));
  }, []);

  const onPay = async () => {
    setPaying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const orderId = await placeOrder(items, totals, method);
      toast.success("Payment successful — order placed!");
      navigate({ to: "/orders", search: { placed: orderId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container-page py-10 min-h-[60vh]">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Checkout</h1>

        {signedIn === false ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Sign in to complete your order.</p>
            <Button asChild className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/account">Sign in</Link>
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-bold">Payment method</h2>
                <RadioGroup
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                  className="mt-4 space-y-3"
                >
                  {METHODS.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      htmlFor={`pm-${value}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        method === value ? "border-amber bg-amber/5" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={value} id={`pm-${value}`} />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
                </RadioGroup>

                <div className="mt-5 border-t border-border pt-5">
                  {method === "upi" && (
                    <div className="space-y-2">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input
                        id="upi"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  )}
                  {method === "card" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="card-number">Card number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-cvv">CVV</Label>
                        <Input
                          id="card-cvv"
                          placeholder="123"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  {method === "netbanking" && (
                    <div className="space-y-2">
                      <Label htmlFor="bank">Select bank</Label>
                      <select
                        id="bank"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Choose your bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                      </select>
                    </div>
                  )}
                  {method === "cod" && (
                    <p className="text-sm text-muted-foreground">
                      Pay in cash when your order is delivered or picked up.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-bold">Order summary</h2>
                <ul className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((i) => (
                    <li key={`${i.id}-${i.mode}`} className="flex items-center gap-3 text-sm">
                      <img
                        src={i.image}
                        alt={i.name}
                        className="h-10 w-10 shrink-0 rounded-md bg-secondary/50 object-contain p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty {i.qty}
                          {i.mode === "rent" ? ` · ${i.days}d` : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold">Total payable</span>
                  <span className="font-display text-2xl font-bold">
                    ₹{totals.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <Button
                  size="lg"
                  disabled={paying}
                  onClick={onPay}
                  className="mt-5 w-full bg-amber text-amber-foreground hover:bg-amber/90 font-semibold"
                >
                  {paying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    `Pay ₹${totals.total.toLocaleString("en-IN")}`
                  )}
                </Button>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber" /> Simulated payment — no real
                  charge is made
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
