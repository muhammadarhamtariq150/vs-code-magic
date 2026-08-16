DROP POLICY IF EXISTS "Authenticated can mark aviator controls consumed" ON public.aviator_admin_controls;
DROP POLICY IF EXISTS "Authenticated can read pending aviator controls" ON public.aviator_admin_controls;
DROP POLICY IF EXISTS "Authenticated can record actual crash" ON public.aviator_admin_controls;

DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_balance_non_negative;
UPDATE public.wallets SET balance = 0 WHERE balance < 0;
ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);

CREATE OR REPLACE FUNCTION public.adjust_own_wallet_balance(_delta numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new numeric;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _delta IS NULL THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF abs(_delta) > 1000000 THEN
    RAISE EXCEPTION 'Amount out of range';
  END IF;

  UPDATE public.wallets
  SET balance = balance + _delta, updated_at = now()
  WHERE user_id = auth.uid() AND balance + _delta >= 0
  RETURNING balance INTO v_new;

  IF v_new IS NULL THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_own_wallet_balance(numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_own_wallet_balance(numeric) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.next_aviator_round_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_aviator_round_id() TO service_role;

REVOKE ALL ON FUNCTION public.advance_aviator_round_seq(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_aviator_round_seq(bigint) TO service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.verify_security_password(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_security_password(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_security_password(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_security_password(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.lookup_referral_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_referral_code(text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_wallet() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_deposit_wager() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_wager_on_bet() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;