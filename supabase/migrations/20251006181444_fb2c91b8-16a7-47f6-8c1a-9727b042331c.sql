-- Facilitar a adição de super_admin
-- Este comentário serve como guia para adicionar um super_admin manualmente

-- PASSO 1: Encontre seu user_id
-- SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- PASSO 2: Adicione o role super_admin
-- Substitua 'SEU_USER_ID_AQUI' pelo ID obtido no PASSO 1
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('SEU_USER_ID_AQUI', 'super_admin'::app_role)
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Função auxiliar para verificar se um usuário é super_admin
CREATE OR REPLACE FUNCTION is_user_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'super_admin'::app_role
  )
$$;