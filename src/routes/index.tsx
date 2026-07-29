import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, BRANDS, PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  Wrench,
  Drill,
  Zap,
  Flame,
  Cog,
  Droplets,
  Hammer,
  HardHat,
  Star,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const iconMap = { Drill, Zap, Flame, Cog, Droplets, Hammer, HardHat, Ladder: Wrench } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "N.B.R Tools — Construction Equipment Rental in Coimbatore" },
      {
        name: "description",
        content: `Rent or buy ${PRODUCTS.length} construction tools in Coimbatore — drills, generators, welders, ladders, safety gear, paint and drying equipment.`,
      },
      {
        property: "og:title",
        content: "N.B.R Tools — Construction Equipment Rental in Coimbatore",
      },
      {
        property: "og:description",
        content: "Construction equipment rental and sales in Coimbatore since 2020.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "N.B.R Tools — Construction Equipment Rental in Coimbatore",
      },
      {
        name: "twitter:description",
        content: "Construction equipment rental and sales in Coimbatore since 2020.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-ink text-ink-foreground">
          <img
            src={heroImg}
            alt="Construction site with heavy equipment at sunset"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
          <div className="relative container-page py-20 md:py-32">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-amber backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                {PRODUCTS.length} tools · Coimbatore delivery
              </div>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.02]">
                Build bigger.
                <br />
                <span className="text-amber">Rent smarter.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-ink-foreground/80 max-w-xl">
                N.B.R Tools — {PRODUCTS.length} construction tools, generators, ladders, welders and
                finishing equipment. Rent by the day, or buy outright. Delivered on time, backed by
                real people.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const q = String(fd.get("q") ?? "").trim();
                  window.location.href = q ? `/shop?q=${encodeURIComponent(q)}` : "/shop";
                }}
                className="mt-8 flex w-full max-w-xl"
              >
                <div className="relative flex-1 min-w-0">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder={`Search ${PRODUCTS.length} tools…`}
                    className="h-12 sm:h-14 rounded-l-full rounded-r-none pl-11 sm:pl-12 bg-background text-foreground border-0 focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 sm:h-14 rounded-l-none rounded-r-full bg-amber text-amber-foreground hover:bg-amber/90 px-4 sm:px-8 font-semibold shrink-0"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="sm:ml-1 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-8 flex flex-wrap gap-4 sm:gap-6 text-sm">
                {[
                  { i: Truck, t: "Coimbatore delivery" },
                  { i: ShieldCheck, t: "Fully insured fleet" },
                  { i: Clock, t: "24/7 site support" },
                ].map(({ i: I, t }) => (
                  <div key={t} className="flex items-center gap-2 text-ink-foreground/80">
                    <I className="h-4 w-4 text-amber" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="container-page py-16">
          <SectionHeading eyebrow="Browse" title="Shop by category" />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((c) => {
              const Icon = iconMap[c.icon as keyof typeof iconMap] ?? Wrench;
              return (
                <Link
                  key={c.slug}
                  to="/shop"
                  search={{ q: undefined, category: c.slug, brand: undefined }}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-amber hover:shadow-elegant hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary group-hover:bg-amber/15 transition-colors">
                    <Icon className="h-6 w-6 text-ink group-hover:text-amber transition-colors" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TRENDING */}
        <section id="deals" className="container-page py-8">
          <SectionHeading
            eyebrow="Trending this week"
            title="Most-rented equipment"
            action={
              <Link
                to="/shop"
                className="text-sm font-medium text-amber hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {PRODUCTS.slice(0, 8).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>

        {/* PROMO STRIP */}
        <section className="container-page py-16">
          <div className="relative overflow-hidden rounded-2xl bg-ink text-ink-foreground p-10 md:p-14">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber/25 blur-3xl" />
            <div className="relative grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="text-xs uppercase tracking-widest text-amber">Monsoon Offer</div>
                <h3 className="mt-2 font-display text-3xl md:text-4xl font-bold">
                  Flat 15% off on weekly rentals
                </h3>
                <p className="mt-3 text-ink-foreground/70 max-w-md">
                  Book any equipment for 7 days or more and save 15% instantly. No coupon required.
                </p>
                <Button className="mt-6 bg-amber text-amber-foreground hover:bg-amber/90" size="lg">
                  Explore offers
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { n: "8,400+", l: "Deliveries" },
                  { n: "97%", l: "On-time" },
                  { n: "4.8★", l: "Rating" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="font-display text-2xl md:text-3xl font-bold text-amber">
                      {s.n}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-ink-foreground/60">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* NEWLY ADDED */}
        <section className="container-page py-8">
          <SectionHeading eyebrow="Just in" title="Recently added" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {PRODUCTS.slice(4, 8).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>

        {/* BRANDS */}
        <section id="brands" className="container-page py-16">
          <SectionHeading eyebrow="Trusted brands" title="We stock only the best" />
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {BRANDS.map((b) => (
              <div
                key={b}
                className="flex h-16 sm:h-20 items-center justify-center rounded-xl border border-border bg-card font-display text-sm sm:text-base font-semibold text-muted-foreground hover:text-ink hover:border-amber transition-colors"
              >
                {b}
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Contractors love us" title="What our customers say" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  q: "Delivered a generator to our site in 2 hours flat. Saved the project.",
                  n: "Ravi K.",
                  r: "Site Engineer, L&T",
                },
                {
                  q: "Best pricing on jackhammers in the region, and equipment is always maintained.",
                  n: "Meera S.",
                  r: "Contractor",
                },
                {
                  q: "The rental extension feature is a lifesaver. Everything just works.",
                  n: "Karthik R.",
                  r: "Project Manager",
                },
              ].map((t) => (
                <div key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex gap-0.5 text-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">"{t.q}"</p>
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="font-semibold text-sm">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ + CONTACT */}
        <section className="container-page py-20 grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Questions" title="Frequently asked" />
            <Accordion type="single" collapsible className="mt-6">
              {[
                {
                  q: "How does the rental process work?",
                  a: "Choose your equipment and rental dates, we deliver to your site, you use it, we pick it up. Simple.",
                },
                {
                  q: "Do you require a security deposit?",
                  a: "Yes, a refundable deposit is charged per item. It's returned within 3 business days after inspection.",
                },
                {
                  q: "What if the equipment breaks down?",
                  a: "We replace it within 4 hours anywhere in the metro area. Zero downtime, zero questions.",
                },
                {
                  q: "Can I extend my rental?",
                  a: "Extend directly from your dashboard, up to the moment before pickup.",
                },
                {
                  q: "Do you offer bulk pricing?",
                  a: "Yes — reach out to our team for a custom quote on 3+ items or long-term rentals.",
                },
              ].map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="rounded-2xl bg-ink text-ink-foreground p-8 md:p-10">
            <div className="text-xs uppercase tracking-widest text-amber">Talk to a human</div>
            <h3 className="mt-2 font-display text-3xl font-bold">Need equipment today?</h3>
            <p className="mt-3 text-ink-foreground/70">
              Our site team responds within 15 minutes, 7 days a week. Call 9047711602 or
              9940747703, or email yashwanthbuddhi@gmail.com.
            </p>
            <div className="mt-8 space-y-3">
              <Input
                placeholder="Your name"
                className="h-12 bg-white/5 border-white/10 text-ink-foreground placeholder:text-ink-foreground/50"
              />
              <Input
                placeholder="Phone number"
                className="h-12 bg-white/5 border-white/10 text-ink-foreground placeholder:text-ink-foreground/50"
              />
              <Input
                placeholder="What do you need?"
                className="h-12 bg-white/5 border-white/10 text-ink-foreground placeholder:text-ink-foreground/50"
              />
              <Button
                size="lg"
                className="w-full bg-amber text-amber-foreground hover:bg-amber/90 font-semibold"
              >
                Request a callback
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-amber font-medium">{eyebrow}</div>
        <h2 className="mt-1 font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
