-- Create payment_settings table for admin's bank/payment details
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method deposit_method NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  ifsc_code TEXT,
  wallet_address TEXT,
  network TEXT,
  qr_code_url TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view active payment settings (for deposit form)
CREATE POLICY "Anyone can view active payment settings"
ON public.payment_settings
FOR SELECT
USING (is_active = true);

-- Admins can view all payment settings
CREATE POLICY "Admins can view all payment settings"
ON public.payment_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage payment settings
CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
ON public.payment_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment settings"
ON public.payment_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();