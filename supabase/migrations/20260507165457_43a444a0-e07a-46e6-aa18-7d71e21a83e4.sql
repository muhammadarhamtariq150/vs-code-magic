ALTER TABLE public.aviator_admin_controls REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aviator_admin_controls;