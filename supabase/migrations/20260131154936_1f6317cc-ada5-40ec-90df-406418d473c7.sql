-- Create referral_codes table to store unique promo codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral code
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own referral code
CREATE POLICY "Users can insert their own referral code"
ON public.referral_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all referral codes
CREATE POLICY "Admins can view all referral codes"
ON public.referral_codes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all referral codes
CREATE POLICY "Admins can manage referral codes"
ON public.referral_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can look up a referral code (for registration validation)
CREATE POLICY "Anyone can lookup referral codes by code"
ON public.referral_codes
FOR SELECT
USING (true);

-- Create index for fast code lookups
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);

-- Create referral_bonuses table to track referral rewards
CREATE TABLE public.referral_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referrer_bonus NUMERIC NOT NULL DEFAULT 50,
  referred_bonus NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral bonuses
CREATE POLICY "Users can view their referral bonuses"
ON public.referral_bonuses
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Admins can view all referral bonuses
CREATE POLICY "Admins can view all referral bonuses"
ON public.referral_bonuses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage referral bonuses
CREATE POLICY "Admins can manage referral bonuses"
ON public.referral_bonuses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to auto-generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate a random 6-character alphanumeric code
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, new_code);
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to generate code on signup
CREATE TRIGGER on_auth_user_created_generate_code
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();