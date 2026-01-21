-- Fix security: Remove public read access to profiles, restrict to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can only view their own profile (unless admin)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix bank_details: Add more restrictive policies
DROP POLICY IF EXISTS "Users can view their own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can manage their own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Admins can view all bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Admins can manage all bank details" ON public.bank_details;

-- Recreate with stricter policies
CREATE POLICY "Users can view own bank details"
ON public.bank_details
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank details"
ON public.bank_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank details"
ON public.bank_details
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank details"
ON public.bank_details
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bank details"
ON public.bank_details
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bank details"
ON public.bank_details
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Same for usdt_wallets
DROP POLICY IF EXISTS "Users can view their own USDT wallets" ON public.usdt_wallets;
DROP POLICY IF EXISTS "Users can manage their own USDT wallets" ON public.usdt_wallets;
DROP POLICY IF EXISTS "Admins can view all USDT wallets" ON public.usdt_wallets;
DROP POLICY IF EXISTS "Admins can manage all USDT wallets" ON public.usdt_wallets;

CREATE POLICY "Users can view own USDT wallets"
ON public.usdt_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own USDT wallets"
ON public.usdt_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own USDT wallets"
ON public.usdt_wallets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own USDT wallets"
ON public.usdt_wallets
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all USDT wallets"
ON public.usdt_wallets
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage USDT wallets"
ON public.usdt_wallets
FOR ALL
USING (has_role(auth.uid(), 'admin'));