
CREATE SEQUENCE IF NOT EXISTS public.aviator_round_seq START WITH 72243383 INCREMENT BY 1;

ALTER TABLE public.aviator_admin_controls
  ALTER COLUMN round_id SET DEFAULT nextval('public.aviator_round_seq');

CREATE OR REPLACE FUNCTION public.next_aviator_round_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.aviator_round_seq');
$$;

GRANT EXECUTE ON FUNCTION public.next_aviator_round_id() TO authenticated, anon;
GRANT USAGE ON SEQUENCE public.aviator_round_seq TO authenticated, anon, service_role;
