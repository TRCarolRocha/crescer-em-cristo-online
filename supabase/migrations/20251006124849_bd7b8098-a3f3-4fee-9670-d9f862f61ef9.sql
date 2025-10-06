-- Criar tabela de igrejas
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  headline TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active churches"
ON public.churches FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage churches"
ON public.churches FOR ALL
TO authenticated
USING (public.is_admin());

-- Inserir Monte Hebrom
INSERT INTO public.churches (
  slug, 
  name, 
  logo_url, 
  headline, 
  description,
  is_public
) VALUES (
  'monte-hebrom',
  'Igreja Batista Missionária Ministério Monte Hebrom',
  '/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png',
  'Lugar de Refúgio e Aliança',
  'Onde Vidas São Transformadas pelo Poder da Palavra',
  false
);

-- Adicionar campo church_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN church_id UUID REFERENCES public.churches(id);

-- Vincular usuários existentes à Monte Hebrom
UPDATE public.profiles 
SET church_id = (
  SELECT id FROM public.churches 
  WHERE slug = 'monte-hebrom' 
  LIMIT 1
)
WHERE church_id IS NULL;

-- Trigger para updated_at
CREATE TRIGGER update_churches_updated_at
BEFORE UPDATE ON public.churches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar flag is_public em tabelas de conteúdo
ALTER TABLE public.discipleship_tracks 
ADD COLUMN is_public BOOLEAN DEFAULT false;

ALTER TABLE public.devocionais 
ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Atualizar políticas RLS para permitir acesso público
CREATE POLICY "Anyone can view public tracks"
ON public.discipleship_tracks FOR SELECT
USING (is_public = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view public devotionals"
ON public.devocionais FOR SELECT
USING (is_public = true OR auth.uid() IS NOT NULL);