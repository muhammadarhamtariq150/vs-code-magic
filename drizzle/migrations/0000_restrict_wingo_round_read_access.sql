DROP POLICY IF EXISTS "Anyone can view wingo rounds" ON public.wingo_rounds;
CREATE POLICY "Signed-in users can view Wingo rounds"
  ON public.wingo_rounds
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);