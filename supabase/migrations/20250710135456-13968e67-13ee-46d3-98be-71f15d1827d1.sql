
-- Criar tabela para devocionais diários
CREATE TABLE public.devocionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  tema TEXT NOT NULL,
  versiculo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  texto_central TEXT NOT NULL,
  pergunta_1 TEXT NOT NULL,
  pergunta_2 TEXT NOT NULL,
  pergunta_3 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de devocionais por usuário
CREATE TABLE public.devocional_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  devocional_id UUID NOT NULL REFERENCES public.devocionais(id),
  resposta_1 TEXT,
  resposta_2 TEXT,
  resposta_3 TEXT,
  oracao TEXT,
  gratidao TEXT,
  aprendizado TEXT,
  completado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, devocional_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.devocionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devocional_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para devocionais (todos podem ver)
CREATE POLICY "Anyone can view devocionais" 
  ON public.devocionais 
  FOR SELECT 
  USING (true);

-- Políticas para histórico (apenas próprio usuário)
CREATE POLICY "Users can view their own devocional history" 
  ON public.devocional_historico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devocional history" 
  ON public.devocional_historico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devocional history" 
  ON public.devocional_historico 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar bucket para avatars (fotos de perfil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para bucket de avatars (público para visualização)
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Inserir devocional de exemplo para hoje
INSERT INTO public.devocionais (
  data, 
  tema, 
  versiculo, 
  referencia, 
  texto_central, 
  pergunta_1, 
  pergunta_2, 
  pergunta_3
) VALUES (
  CURRENT_DATE,
  'O Amor de Deus',
  'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  'João 3:16',
  'O amor de Deus é incomparável e sacrificial. Ele não apenas nos ama, mas demonstrou esse amor através do maior sacrifício - entregar Seu próprio Filho por nós. Este versículo nos lembra que o amor divino não é apenas um sentimento, mas uma ação concreta que transformou a história da humanidade. Quando compreendemos a profundidade deste amor, somos movidos a responder com gratidão e a compartilhar esse mesmo amor com outros.',
  'Como você tem experimentado o amor de Deus em sua vida recentemente?',
  'De que maneiras práticas você pode demonstrar o amor de Cristo para outras pessoas hoje?',
  'O que este versículo revela sobre o caráter de Deus e como isso impacta sua fé?'
);
