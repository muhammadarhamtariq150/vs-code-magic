CREATE OR REPLACE FUNCTION public.advance_aviator_round_seq(_to bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setval('public.aviator_round_seq', GREATEST(_to, (SELECT last_value FROM public.aviator_round_seq)), true);
$$;

GRANT EXECUTE ON FUNCTION public.advance_aviator_round_seq(bigint) TO authenticated, anon, service_role;