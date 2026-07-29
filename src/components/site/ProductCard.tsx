import { Link } from "@tanstack/react-router";
import { Star, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

const badgeStyle: Record<string, string> = {
  trending: "bg-amber text-amber-foreground",
  deal: "bg-destructive text-destructive-foreground",
  new: "bg-ink text-ink-foreground",
  popular: "bg-success text-white",
};

export function ProductCard({ p }: { p: Product }) {
  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p, { mode: "rent", qty: 1, days: 1 });
    toast.success(`Added ${p.name} to cart`);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-elegant hover:-translate-y-0.5">
      {p.badge && (
        <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyle[p.badge]}`}>
          {p.badge}
        </span>
      )}
      <button aria-label="Save" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="h-4 w-4" />
      </button>
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block aspect-square overflow-hidden bg-secondary">
        <img
          src={p.image}
          alt={p.name}
          width={900}
          height={900}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
        <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:text-amber transition-colors">
          {p.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber text-amber" />
          <span className="font-medium text-foreground">{p.rating}</span>
          <span>({p.reviews})</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-lg font-bold leading-none truncate">₹{p.rentalPerDay.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">per day · rent</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-muted-foreground">Buy</div>
            <div className="text-sm font-semibold">₹{p.salePrice.toLocaleString("en-IN")}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-ink text-ink-foreground hover:bg-ink/90">
            <Link to="/product/$slug" params={{ slug: p.slug }}>Details</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onAdd} aria-label="Add to cart" className="shrink-0 border-amber text-amber hover:bg-amber hover:text-amber-foreground">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
