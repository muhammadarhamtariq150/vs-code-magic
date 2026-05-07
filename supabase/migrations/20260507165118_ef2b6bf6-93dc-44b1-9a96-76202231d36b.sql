
-- 1. Referral codes: remove public-readable policy; add SECURITY DEFINER lookup
DROP POLICY IF EXISTS "Anyone can lookup referral codes by code" ON public.referral_codes;

CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code text)
RETURNS TABLE(user_id uuid, code text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, code
  FROM public.referral_codes
  WHERE code = upper(_code)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referral_code(text) TO anon, authenticated;

-- 2. ip_logs: remove user-spoofable INSERT policy. Edge function uses service role.
DROP POLICY IF EXISTS "System can insert IP logs" ON public.ip_logs;

-- 3. Profiles: protect security_password_hash via column-level revoke + has flag
-- Add a generated has_security_password column for clients
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_security_password boolean
  GENERATED ALWAYS AS (security_password_hash IS NOT NULL) STORED;

-- Revoke select on hash column from anon/authenticated (admins use service role / has_role)
REVOKE SELECT (security_password_hash) ON public.profiles FROM anon, authenticated;

-- Server-side verification function (uses pgcrypto if available; falls back to text compare for legacy plaintext)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.verify_security_password(_password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT security_password_hash INTO v_hash
  FROM public.profiles
  WHERE user_id = auth.uid();
  IF v_hash IS NULL OR _password IS NULL THEN
    RETURN false;
  END IF;
  -- bcrypt-style hash comparison; fallback to direct compare for legacy values
  IF v_hash LIKE '$2%' THEN
    RETURN crypt(_password, v_hash) = v_hash;
  END IF;
  RETURN v_hash = _password;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_security_password(text) TO authenticated;

-- Function to set/change security password (hashed with bcrypt)
CREATE OR REPLACE FUNCTION public.set_security_password(_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _new_password IS NULL OR length(_new_password) < 4 THEN
    RAISE EXCEPTION 'Password too short';
  END IF;
  UPDATE public.profiles
  SET security_password_hash = crypt(_new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_security_password(text) TO authenticated;
