-- ETAPA 1: Normalização de Permissões e Roles (Corrigida)
-- ================================================

-- 1. Adicionar 'visitor' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'visitor';

-- 2. Migrar dados de profiles.role para user_roles.role
INSERT INTO public.user_roles (user_id, role, church_id)
SELECT 
  p.id,
  CASE 
    WHEN p.role = 'admin' THEN 'admin'::public.app_role
    WHEN p.role = 'lider' THEN 'lider'::public.app_role
    WHEN p.role = 'member' THEN 'member'::public.app_role
    ELSE 'member'::public.app_role
  END,
  p.church_id
FROM public.profiles p
WHERE p.role IS NOT NULL 
  AND p.role IN ('admin', 'lider', 'member')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Sincronizar church_id entre profiles e user_roles
UPDATE public.user_roles ur
SET church_id = p.church_id
FROM public.profiles p
WHERE ur.user_id = p.id
  AND ur.church_id IS DISTINCT FROM p.church_id
  AND ur.role IN ('admin', 'lider', 'member');

-- 4. ATUALIZAR POLÍTICAS RLS que dependem de profiles.role
-- Antes de dropar a coluna, precisamos atualizar as políticas

-- 4.1 Política em mensagens
DROP POLICY IF EXISTS "Admins can view all messages" ON public.mensagens;
CREATE POLICY "Admins can view all messages" 
ON public.mensagens 
FOR SELECT 
USING (public.is_admin());

-- 4.2 Política em agenda_eventos
DROP POLICY IF EXISTS "Full access admin" ON public.agenda_eventos;
CREATE POLICY "Full access admin" 
ON public.agenda_eventos 
FOR ALL 
USING (public.is_admin());

-- 4.3 Políticas em group_members
DROP POLICY IF EXISTS "Admins can insert group members" ON public.group_members;
CREATE POLICY "Admins can insert group members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;
CREATE POLICY "Admins can delete group members" 
ON public.group_members 
FOR DELETE 
USING (public.is_admin());

-- 5. Remover coluna profiles.role (agora seguro)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 6. Atualizar função is_church_admin
CREATE OR REPLACE FUNCTION public.is_church_admin(p_church_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
      AND (
        role = 'super_admin'::public.app_role OR
        church_id = p_church_id OR 
        church_id IS NULL
      )
  )
$$;

-- 7. Criar função para verificar se usuário é líder
CREATE OR REPLACE FUNCTION public.is_group_leader(p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(p_user_id, auth.uid())
      AND role = 'lider'::public.app_role
  )
$$;

-- 8. Criar função auxiliar para obter church_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_church_id(p_user_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT church_id
  FROM public.profiles
  WHERE id = COALESCE(p_user_id, auth.uid())
  LIMIT 1
$$;

-- 9. Comentários para documentação
COMMENT ON FUNCTION public.is_church_admin IS 'Verifica se o usuário é admin de uma igreja específica. Super admins têm acesso a todas as igrejas. Admins com church_id NULL são admins globais.';
COMMENT ON FUNCTION public.is_group_leader IS 'Verifica se o usuário tem a role de líder (lider).';
COMMENT ON FUNCTION public.get_user_church_id IS 'Retorna o church_id do perfil do usuário.';