import { useSyncExternalStore } from "react";
import { getProductById, type Product } from "./products";
import { supabase } from "@/integrations/supabase/client";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  brand: string;
  mode: "rent" | "buy";
  qty: number;
  days: number;
  unitPrice: number; // per-day for rent, total for buy
  deposit: number;
};

const KEY = "nbr-cart-v1";
const listeners = new Set<() => void>();
let ownerId: string | undefined;
let cache: CartItem[] = load(ownerId);

function storageKey(forOwnerId: string | undefined) {
  return forOwnerId ? `${KEY}:${forOwnerId}` : KEY;
}

function load(forOwnerId: string | undefined): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(forOwnerId));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(ownerId), JSON.stringify(cache));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l());
  void syncRemoteCart();
}

async function syncRemoteCart() {
  if (!ownerId) return;
  const rows = cache.map((item) => ({
    user_id: ownerId!,
    product_id: item.id,
    mode: item.mode,
    qty: item.qty,
    days: item.days,
  }));
  const { error } = await supabase.from("cart_items").delete().eq("user_id", ownerId);
  if (error || !rows.length) return;
  await supabase.from("cart_items").upsert(rows, { onConflict: "user_id,product_id,mode" });
}

async function hydrateRemoteCart() {
  if (!ownerId) return;
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, mode, qty, days")
    .eq("user_id", ownerId);
  if (error || !data?.length) return;

  const remoteItems = data.flatMap((row) => {
    const product = getProductById(row.product_id);
    if (!product || (row.mode !== "rent" && row.mode !== "buy")) return [];
    return [
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        brand: product.brand,
        mode: row.mode,
        qty: row.qty,
        days: row.days,
        unitPrice: row.mode === "rent" ? product.rentalPerDay : product.salePrice,
        deposit: row.mode === "rent" ? product.deposit : 0,
      } satisfies CartItem,
    ];
  });

  // Merge rather than replace: a locally-added item may not have synced to
  // the server yet, and this fetch shouldn't be able to make it disappear.
  const merged = [...cache];
  remoteItems.forEach((item) => {
    const existing = merged.find((c) => c.id === item.id && c.mode === item.mode);
    if (!existing) merged.push(item);
  });
  cache = merged;
  listeners.forEach((l) => l());
}

export function setCartOwner(userId?: string) {
  if (userId === ownerId) return; // avoid discarding just-added items on redundant calls
  const previousOwnerId = ownerId;
  ownerId = userId;

  if (userId && !previousOwnerId) {
    // Guest -> signed-in transition: merge the guest cart into the user's
    // cart instead of losing whatever was added before sign-in resolved.
    const guestItems = load(undefined);
    const userItems = load(userId);
    guestItems.forEach((item) => {
      const existing = userItems.find((c) => c.id === item.id && c.mode === item.mode);
      if (existing) existing.qty += item.qty;
      else userItems.push(item);
    });
    cache = userItems;
    if (guestItems.length) {
      window.localStorage.removeItem(storageKey(undefined));
      persist();
    }
  } else {
    cache = load(userId);
  }

  listeners.forEach((listener) => listener());
  if (ownerId) void hydrateRemoteCart();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToCart(
  p: Product,
  opts: { mode: "rent" | "buy"; qty?: number; days?: number } = { mode: "rent" },
) {
  const qty = Math.max(1, opts.qty ?? 1);
  const days = Math.max(1, opts.days ?? 1);
  const mode = opts.mode;
  const unitPrice = mode === "rent" ? p.rentalPerDay : p.salePrice;
  const deposit = mode === "rent" ? p.deposit : 0;
  const existing = cache.find((c) => c.id === p.id && c.mode === mode);
  if (existing) {
    existing.qty += qty;
    existing.days = days;
  } else {
    cache = [
      ...cache,
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        image: p.image,
        brand: p.brand,
        mode,
        qty,
        days,
        unitPrice,
        deposit,
      },
    ];
  }
  persist();
}

export function updateQty(id: string, mode: "rent" | "buy", qty: number) {
  cache = cache.map((c) => (c.id === id && c.mode === mode ? { ...c, qty: Math.max(1, qty) } : c));
  persist();
}

export function updateDays(id: string, mode: "rent" | "buy", days: number) {
  cache = cache.map((c) =>
    c.id === id && c.mode === mode ? { ...c, days: Math.max(1, days) } : c,
  );
  persist();
}

export function removeItem(id: string, mode: "rent" | "buy") {
  cache = cache.filter((c) => !(c.id === id && c.mode === mode));
  persist();
}

export function clearCart() {
  cache = [];
  persist();
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (s, i) => s + i.unitPrice * i.qty * (i.mode === "rent" ? i.days : 1),
    0,
  );
  const deposits = items.reduce((s, i) => s + i.deposit * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = items.length ? 199 : 0;
  const total = subtotal + gst + delivery + deposits;
  return { subtotal, gst, delivery, deposits, total };
}
