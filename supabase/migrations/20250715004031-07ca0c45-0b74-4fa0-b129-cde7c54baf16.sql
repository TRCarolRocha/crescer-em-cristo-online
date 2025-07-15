
-- Criar função para verificar se usuário é admin (evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas para devocionais
CREATE POLICY "Admins can manage devocionais" 
  ON public.devocionais 
  FOR ALL 
  USING (public.is_admin());

-- Políticas para discipleship_tracks  
CREATE POLICY "Admins can manage tracks" 
  ON public.discipleship_tracks 
  FOR ALL 
  USING (public.is_admin());

-- Políticas para conteudos
CREATE POLICY "Admins can manage conteudos" 
  ON public.conteudos 
  FOR ALL 
  USING (public.is_admin());

-- Políticas para avisos (complementar a existente de SELECT)
CREATE POLICY "Admins can insert avisos" 
  ON public.avisos 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update avisos" 
  ON public.avisos 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete avisos" 
  ON public.avisos 
  FOR DELETE 
  USING (public.is_admin());
