-- Wingo game rounds table
CREATE TABLE public.wingo_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id TEXT NOT NULL UNIQUE,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('1min', '2min', '3min', '5min')),
  winning_number INTEGER CHECK (winning_number >= 0 AND winning_number <= 9),
  winning_color TEXT CHECK (winning_color IN ('green', 'red', 'violet')),
  winning_size TEXT CHECK (winning_size IN ('big', 'small')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'betting_closed', 'completed')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_admin_controlled BOOLEAN DEFAULT false,
  admin_set_number INTEGER CHECK (admin_set_number >= 0 AND admin_set_number <= 9),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wingo bets table
CREATE TABLE public.wingo_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  round_id UUID NOT NULL REFERENCES public.wingo_rounds(id),
  bet_type TEXT NOT NULL CHECK (bet_type IN ('number', 'color', 'size')),
  bet_value TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  potential_win NUMERIC NOT NULL,
  is_winner BOOLEAN,
  payout NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin controls for setting next round results
CREATE TABLE public.wingo_admin_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('1min', '2min', '3min', '5min')),
  next_number INTEGER CHECK (next_number >= 0 AND next_number <= 9),
  set_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wingo_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wingo_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wingo_admin_controls ENABLE ROW LEVEL SECURITY;

-- Wingo rounds policies (everyone can view, only system/admin can modify)
CREATE POLICY "Anyone can view wingo rounds"
  ON public.wingo_rounds FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage wingo rounds"
  ON public.wingo_rounds FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Wingo bets policies
CREATE POLICY "Users can view their own bets"
  ON public.wingo_bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can place their own bets"
  ON public.wingo_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bets"
  ON public.wingo_bets FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bets"
  ON public.wingo_bets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin controls policies
CREATE POLICY "Admins can view controls"
  ON public.wingo_admin_controls FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage controls"
  ON public.wingo_admin_controls FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_wingo_rounds_duration ON public.wingo_rounds(duration_type, status);
CREATE INDEX idx_wingo_rounds_end_time ON public.wingo_rounds(end_time);
CREATE INDEX idx_wingo_bets_user ON public.wingo_bets(user_id);
CREATE INDEX idx_wingo_bets_round ON public.wingo_bets(round_id);

-- Enable realtime for rounds table
ALTER PUBLICATION supabase_realtime ADD TABLE public.wingo_rounds;