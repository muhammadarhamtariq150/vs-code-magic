ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS screenshot_path text;

CREATE POLICY "Users can upload own deposit screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'deposit-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own deposit screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'deposit-screenshots' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
