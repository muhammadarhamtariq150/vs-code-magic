CREATE OR REPLACE FUNCTION public.admin_peek_next_aviator_round_id()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last bigint;
  v_called boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  SELECT last_value, is_called INTO v_last, v_called FROM public.aviator_round_seq;
  RETURN CASE WHEN v_called THEN v_last + 1 ELSE v_last END;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_peek_next_aviator_round_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_peek_next_aviator_round_id() TO authenticated, service_role;