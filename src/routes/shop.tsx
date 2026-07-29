import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS, CATEGORIES, BRANDS } from "@/lib/products";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  brand: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: `Shop ${PRODUCTS.length} Construction Tools — N.B.R Tools` },
      {
        name: "description",
        content: `Rent or buy from ${PRODUCTS.length} professional construction tools — drills, saws, generators, ladders, welders, safety gear and more.`,
      },
      { property: "og:title", content: `Shop ${PRODUCTS.length} Construction Tools — N.B.R Tools` },
      {
        property: "og:description",
        content: `Rent or buy from ${PRODUCTS.length} professional construction tools.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q, category, brand } = Route.useSearch();
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  const [brands, setBrands] = useState<string[]>(brand ? [brand] : []);
  const [priceMax, setPriceMax] = useState(6000);
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState(q);

  // Sync when URL params change (e.g. header search submission)
  useEffect(() => {
    setQuery(q);
  }, [q]);
  useEffect(() => {
    setCats(category ? [category] : []);
  }, [category]);
  useEffect(() => {
    setBrands(brand ? [brand] : []);
  }, [brand]);

  const filtered = useMemo(() => {
    const qLower = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const matchesText =
        !qLower ||
        p.name.toLowerCase().includes(qLower) ||
        p.brand.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower);
      return (
        matchesText &&
        (cats.length === 0 || cats.includes(p.category)) &&
        (brands.length === 0 || brands.includes(p.brand)) &&
        p.rentalPerDay <= priceMax
      );
    });
    if (sort === "low") list = [...list].sort((a, b) => a.rentalPerDay - b.rentalPerDay);
    if (sort === "high") list = [...list].sort((a, b) => b.rentalPerDay - a.rentalPerDay);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cats, brands, priceMax, sort, query]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <>
      <Header />
      <main className="container-page py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">All Equipment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} of {PRODUCTS.length} tools
            {query && (
              <>
                {" "}
                matching <span className="font-medium text-foreground">"{query}"</span>
              </>
            )}
          </p>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mt-2 inline-flex items-center gap-1 text-xs text-amber hover:underline"
            >
              <X className="h-3 w-3" /> Clear search
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="space-y-8">
            <FilterGroup title="Category">
              {CATEGORIES.map((c) => (
                <label
                  key={c.slug}
                  className="flex items-center gap-2.5 py-1 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={cats.includes(c.slug)}
                    onCheckedChange={() => toggle(cats, c.slug, setCats)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Brand">
              {BRANDS.map((b) => (
                <label key={b} className="flex items-center gap-2.5 py-1 text-sm cursor-pointer">
                  <Checkbox
                    checked={brands.includes(b)}
                    onCheckedChange={() => toggle(brands, b, setBrands)}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Rental / day">
              <Slider
                value={[priceMax]}
                onValueChange={(v) => setPriceMax(v[0])}
                min={100}
                max={6000}
                step={100}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>₹100</span>
                <span className="font-semibold text-foreground">Up to ₹{priceMax}</span>
              </div>
            </FilterGroup>

            <FilterGroup title="Rating">
              {[4, 3].map((r) => (
                <label key={r} className="flex items-center gap-2.5 py-1 text-sm cursor-pointer">
                  <Checkbox />
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < r ? "fill-amber text-amber" : "text-muted"}`}
                      />
                    ))}
                    <span className="ml-1 text-muted-foreground">& up</span>
                  </span>
                </label>
              ))}
            </FilterGroup>

            {(cats.length > 0 || brands.length > 0 || query) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCats([]);
                  setBrands([]);
                  setQuery("");
                  setPriceMax(5000);
                }}
                className="w-full"
              >
                Reset filters
              </Button>
            )}
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                results
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="low">Price: low to high</SelectItem>
                  <SelectItem value="high">Price: high to low</SelectItem>
                  <SelectItem value="rating">Best rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No products match your search. Try loosening the filters or a different keyword.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
