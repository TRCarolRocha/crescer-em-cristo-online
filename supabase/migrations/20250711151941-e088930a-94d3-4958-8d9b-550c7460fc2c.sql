
-- Criar tabela de diagnósticos unificada
CREATE TABLE public.diagnosticos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  respostas jsonb NOT NULL,
  data_resposta timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para diagnósticos
CREATE POLICY "Users can view own diagnostics" ON public.diagnosticos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics" ON public.diagnosticos
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar tabela agenda_eventos
CREATE TABLE public.agenda_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data_inicio date NOT NULL,
  data_fim date,
  local text,
  status boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agenda
CREATE POLICY "Read agenda logado" ON public.agenda_eventos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Full access admin" ON public.agenda_eventos
FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Criar tabela de ministérios e departamentos
CREATE TABLE public.ministerios_departamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL
);

-- Preenchimento inicial
INSERT INTO public.ministerios_departamentos (nome) VALUES
('Louvor'), ('Intercessão'), ('Mídia'), ('Ensino'), 
('Infantil'), ('Jovens'), ('Mulheres'), ('Comunicação'), ('Evangelismo');

-- Alterar tabela profiles para adicionar tags
ALTER TABLE public.profiles
ADD COLUMN tags uuid[];

-- Criar tabela de mensagens para "Fale com a Liderança"
CREATE TABLE public.mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id uuid REFERENCES auth.users NOT NULL,
  destinatario_id uuid REFERENCES auth.users,
  conteudo text NOT NULL,
  enviada_em timestamp with time zone DEFAULT now(),
  lida boolean DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mensagens
CREATE POLICY "Users can view own messages" ON public.mensagens
FOR SELECT USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

CREATE POLICY "Users can send messages" ON public.mensagens
FOR INSERT WITH CHECK (auth.uid() = remetente_id);

CREATE POLICY "Admins can view all messages" ON public.mensagens
FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));
