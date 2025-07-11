
-- Atualizar políticas RLS para profiles para permitir que admins vejam e editem todos os perfis
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin());

-- Permitir que admins gerenciem avisos
CREATE POLICY "Admins can manage avisos" 
  ON public.avisos 
  FOR ALL 
  USING (public.is_admin());

-- Permitir que admins gerenciem devocionais
CREATE POLICY "Admins can manage devocionais" 
  ON public.devocionais 
  FOR ALL 
  USING (public.is_admin());

-- Adicionar campo ativo na tabela profiles para inativar/reativar membros
ALTER TABLE public.profiles 
ADD COLUMN ativo BOOLEAN DEFAULT true;

-- Atualizar política de visualização de perfis para considerar apenas usuários ativos
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view active profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (ativo = true OR auth.uid() = id OR public.is_admin());
