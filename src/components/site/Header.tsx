import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, Heart, User, Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, type FormEvent } from "react";
import { setCartOwner, useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const cart = useCart();
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const currentQ =
    routerState.location.pathname === "/shop"
      ? ((routerState.location.search as { q?: string }).q ?? "")
      : "";
  const [q, setQ] = useState(currentQ);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.session?.user));
      setCartOwner(data.session?.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setCartOwner(session?.user.id);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    navigate({
      to: "/shop",
      search: { q: value || undefined, category: undefined, brand: undefined },
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="Buddhi's N.B.R. Tools"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
        </Link>

        <form onSubmit={onSubmit} className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools, generators, ladders, welders…"
              className="h-11 pl-10 pr-24 rounded-full bg-secondary border-transparent focus-visible:ring-amber"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-9 rounded-full bg-ink text-ink-foreground hover:bg-ink/90"
            >
              Search
            </Button>
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <Link to="/shop" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
            Shop
          </Link>
          <Link
            to="/shop"
            search={{ q: undefined, category: undefined, brand: undefined }}
            className="px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          >
            Rentals
          </Link>
          <a href="#brands" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
            Brands
          </a>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            className="hidden sm:inline-flex"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={signedIn ? "Your account" : "Sign in"}
            className="hidden sm:inline-flex"
          >
            <Link to="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Your orders"
            className="hidden sm:inline-flex"
          >
            <Link to="/orders">
              <Package className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Cart" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-amber-foreground px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={onSubmit} className="md:hidden container-page pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools…"
            className="h-10 pl-10 pr-20 rounded-full bg-secondary border-transparent focus-visible:ring-amber"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1 h-8 rounded-full bg-ink text-ink-foreground hover:bg-ink/90"
          >
            Go
          </Button>
        </div>
      </form>
    </header>
  );
}
