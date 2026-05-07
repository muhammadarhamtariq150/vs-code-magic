CREATE TABLE public.aviator_admin_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crash_point NUMERIC NOT NULL CHECK (crash_point >= 1.00),
  status TEXT NOT NULL DEFAULT 'pending',
  position INTEGER NOT NULL DEFAULT 0,
  set_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_aviator_controls_pending ON public.aviator_admin_controls(status, position, created_at);

ALTER TABLE public.aviator_admin_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aviator controls"
ON public.aviator_admin_controls
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read pending aviator controls"
ON public.aviator_admin_controls
FOR SELECT
TO authenticated
USING (status = 'pending');

CREATE POLICY "Authenticated can mark aviator controls consumed"
ON public.aviator_admin_controls
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (status = 'consumed');
