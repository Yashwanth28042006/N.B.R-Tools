
-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending','paid','cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi','card','netbanking','cod')),
  subtotal INT NOT NULL,
  gst INT NOT NULL,
  delivery INT NOT NULL,
  deposits INT NOT NULL,
  total INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Order items table (snapshot of product details at time of purchase)
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  brand TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('rent','buy')),
  qty INT NOT NULL CHECK (qty > 0),
  days INT NOT NULL CHECK (days > 0),
  unit_price INT NOT NULL,
  deposit INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
