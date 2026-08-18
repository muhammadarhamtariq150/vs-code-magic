CREATE TABLE public.promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT true,
  title text NOT NULL DEFAULT 'BUMPER OFFER',
  subtitle text NOT NULL DEFAULT 'Deposit Today',
  highlight text NOT NULL DEFAULT '50% BONUS',
  description text NOT NULL DEFAULT 'Deposit any amount today and get an instant 50% bonus in your wallet!',
  cta_text text NOT NULL DEFAULT 'Deposit Now',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_banners TO authenticated;
GRANT ALL ON public.promo_banners TO service_role;

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promo banners"
ON public.promo_banners FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert promo banners"
ON public.promo_banners FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promo banners"
ON public.promo_banners FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promo banners"
ON public.promo_banners FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_promo_banners_updated_at
BEFORE UPDATE ON public.promo_banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.promo_banners (enabled) VALUES (true);