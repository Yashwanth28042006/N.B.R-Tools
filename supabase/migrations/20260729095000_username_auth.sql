
-- Self-contained username/password auth, independent of Supabase Auth's
-- email confirmation requirement (not configurable without dashboard access).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS enabled with no policies + no direct grants: app_users is reachable
-- only through the SECURITY DEFINER functions below, never via PostgREST
-- table access, so password hashes can never be selected directly.
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_users FROM anon, authenticated;

CREATE FUNCTION public.signup_user(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF length(trim(p_username)) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters.';
  END IF;
  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.app_users WHERE username = lower(trim(p_username))) THEN
    RAISE EXCEPTION 'That username is already taken.';
  END IF;

  INSERT INTO public.app_users (username, password_hash)
  VALUES (lower(trim(p_username)), crypt(p_password, gen_salt('bf', 10)))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.signup_user(TEXT, TEXT) TO anon, authenticated;

CREATE FUNCTION public.login_user(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id
  FROM public.app_users
  WHERE username = lower(trim(p_username))
    AND password_hash = crypt(p_password, password_hash);

  RETURN found_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon, authenticated;

-- Re-point cart/order ownership at app_users instead of Supabase Auth users,
-- since sign-in no longer goes through auth.users at all.
ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_user_id_fkey;
ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.order_items DROP CONSTRAINT order_items_user_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

-- These tables no longer have a Supabase Auth JWT to check auth.uid() against
-- (sessions are app-managed, not Supabase Auth), so ownership is enforced at
-- the application layer instead. Replace the auth.uid()-based policies with
-- anon-reachable ones scoped by the row's own user_id value.
DROP POLICY IF EXISTS "cart_all_own" ON public.cart_items;
CREATE POLICY "cart_all_anon" ON public.cart_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_all_anon" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT ON public.orders TO anon;

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_all_anon" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT ON public.order_items TO anon;
