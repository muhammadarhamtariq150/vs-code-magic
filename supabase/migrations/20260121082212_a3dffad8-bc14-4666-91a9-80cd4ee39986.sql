-- Withdrawal status enum
CREATE TYPE withdrawal_status AS ENUM ('pending', 'review', 'processing', 'success', 'rejected');

-- Adjustment type enum
CREATE TYPE adjustment_type AS ENUM ('bonus_add', 'bonus_reduce', 'manual_add', 'manual_reduce', 'wager_add', 'wager_reduce');

-- Withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  account_details JSONB NOT NULL DEFAULT '{}',
  status withdrawal_status NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IP Logs table for tracking user logins
CREATE TABLE public.ip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  device_info TEXT,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adjustments table for manual bonus/balance adjustments
CREATE TABLE public.adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adjustment_type adjustment_type NOT NULL,
  amount NUMERIC NOT NULL,
  turnover_multiplier NUMERIC NOT NULL DEFAULT 1,
  turnover_required NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  processed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wager/Turnover tracking table
CREATE TABLE public.wager_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_id UUID REFERENCES deposits(id),
  adjustment_id UUID REFERENCES adjustments(id),
  turnover_required NUMERIC NOT NULL DEFAULT 0,
  turnover_completed NUMERIC NOT NULL DEFAULT 0,
  is_fulfilled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add withdrawal_forbidden and security_password to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS withdrawal_forbidden BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS security_password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES auth.users(id);

-- Bank details table
CREATE TABLE public.bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USDT wallet details table
CREATE TABLE public.usdt_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'TRC20',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wager_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usdt_wallets ENABLE ROW LEVEL SECURITY;

-- Withdrawals policies
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all withdrawals" ON public.withdrawals
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- IP Logs policies (admin only for viewing, system inserts)
CREATE POLICY "Admins can view all IP logs" ON public.ip_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert IP logs" ON public.ip_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Adjustments policies (admin only)
CREATE POLICY "Admins can view all adjustments" ON public.adjustments
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create adjustments" ON public.adjustments
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Wager tracking policies
CREATE POLICY "Users can view their own wager tracking" ON public.wager_tracking
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wager tracking" ON public.wager_tracking
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage wager tracking" ON public.wager_tracking
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bank details policies
CREATE POLICY "Users can view their own bank details" ON public.bank_details
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bank details" ON public.bank_details
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bank details" ON public.bank_details
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all bank details" ON public.bank_details
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- USDT wallet policies
CREATE POLICY "Users can view their own USDT wallets" ON public.usdt_wallets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own USDT wallets" ON public.usdt_wallets
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all USDT wallets" ON public.usdt_wallets
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all USDT wallets" ON public.usdt_wallets
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Admins can view all deposits
CREATE POLICY "Admins can view all deposits" ON public.deposits
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all deposits" ON public.deposits
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Function to auto-create 1x wager on deposit confirmation
CREATE OR REPLACE FUNCTION public.handle_deposit_wager()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO public.wager_tracking (user_id, deposit_id, turnover_required, turnover_completed)
    VALUES (NEW.user_id, NEW.id, NEW.amount * 1, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto wager on deposit
CREATE TRIGGER on_deposit_confirmed
AFTER UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION public.handle_deposit_wager();

-- Function to update turnover on bet
CREATE OR REPLACE FUNCTION public.update_wager_on_bet()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wager_tracking
  SET turnover_completed = turnover_completed + NEW.bet_amount,
      is_fulfilled = (turnover_completed + NEW.bet_amount) >= turnover_required,
      updated_at = now()
  WHERE user_id = NEW.user_id AND is_fulfilled = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update wager on game bet
CREATE TRIGGER on_game_transaction_insert
AFTER INSERT ON public.game_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_wager_on_bet();

-- Trigger for updated_at on withdrawals
CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on wager_tracking
CREATE TRIGGER update_wager_tracking_updated_at
BEFORE UPDATE ON public.wager_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on bank_details
CREATE TRIGGER update_bank_details_updated_at
BEFORE UPDATE ON public.bank_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on usdt_wallets
CREATE TRIGGER update_usdt_wallets_updated_at
BEFORE UPDATE ON public.usdt_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;