-- PARTE 1: Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'lider', 'member');

-- PARTE 2: Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- PARTE 3: Funções security definer para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Atualizar função is_admin para usar nova tabela
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

-- Nova função is_lider
CREATE OR REPLACE FUNCTION public.is_lider()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'lider'::public.app_role)
$$;

-- Função para obter roles de um usuário
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID DEFAULT NULL)
RETURNS TABLE (role public.app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = COALESCE(_user_id, auth.uid())
$$;

-- PARTE 4: Políticas RLS para user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- PARTE 5: Migrar dados existentes de profiles para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::public.app_role
    WHEN role = 'member' THEN 'member'::public.app_role
    ELSE 'member'::public.app_role
  END
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que todos os usuários tenham pelo menos 'member'
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'::public.app_role
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'member'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- PARTE 6: Trigger para updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();