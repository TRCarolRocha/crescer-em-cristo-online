
-- Criar tabela para conteúdos das trilhas
CREATE TABLE public.conteudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trilha_id UUID NOT NULL REFERENCES public.discipleship_tracks(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  texto TEXT,
  video_url TEXT,
  pdf_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para avisos em destaque
CREATE TABLE public.avisos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  categoria TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Políticas para conteudos (todos podem ver)
CREATE POLICY "Anyone can view conteudos"
  ON public.conteudos
  FOR SELECT
  USING (true);

-- Políticas para avisos (todos podem ver)
CREATE POLICY "Anyone can view avisos"
  ON public.avisos
  FOR SELECT
  USING (ativo = true);

-- Inserir conteúdo da trilha "Dons Espirituais"
INSERT INTO public.conteudos (trilha_id, titulo, descricao, texto, video_url, pdf_url, ordem)
SELECT 
  dt.id,
  'O que são dons espirituais?',
  'Uma introdução completa aos dons espirituais e sua importância na vida cristã',
  'Os dons espirituais são capacidades especiais concedidas por Deus através do Espírito Santo a cada crente para edificação do corpo de Cristo. Eles não são talentos naturais, mas sim manifestações sobrenaturais do poder de Deus operando através de nós.

**Características dos Dons Espirituais:**

• **Origem Divina**: Vêm diretamente de Deus, não são desenvolvidos por esforço humano
• **Propósito Específico**: Destinados à edificação, exortação e consolação da Igreja
• **Diversidade**: Existem diferentes tipos de dons para diferentes propósitos
• **Unidade**: Todos procedem do mesmo Espírito Santo

**Principais Categorias:**

1. **Dons de Revelação**: Palavra de sabedoria, palavra de conhecimento, discernimento de espíritos
2. **Dons de Poder**: Fé, dons de curar, operação de maravilhas
3. **Dons de Inspiração**: Profecia, variedade de línguas, interpretação de línguas

**Reflexão Pessoal:**
• Você já identificou algum dom espiritual operando em sua vida?
• Como você pode usar seus dons para edificar outros?
• Que área da igreja você sente um chamado para servir?',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://drive.google.com/file/d/exemplo-dons-espirituais/view',
  1
FROM public.discipleship_tracks dt
WHERE dt.title ILIKE '%dons%' OR dt.level = 'crescimento'
LIMIT 1;

-- Inserir avisos em destaque de exemplo
INSERT INTO public.avisos (titulo, descricao, categoria, ordem) VALUES
('Culto de Domingo', 'Junte-se a nós para um tempo especial de adoração e palavra', 'Culto', 1),
('Estudo Bíblico às Quartas', 'Aprofunde-se nas Escrituras conosco toda quarta-feira às 19h30', 'Estudo', 2),
('Sorteio de Livros', 'Participe do sorteio mensal de livros cristãos para toda família', 'Sorteio', 3),
('Saída dos Jovens', 'Aventura e comunhão para os jovens no próximo sábado', 'Saída', 4);
