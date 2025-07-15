
-- Adicionar política para permitir que administradores atualizem qualquer perfil
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin());

-- Também adicionar política para que administradores possam visualizar todos os perfis
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin());
