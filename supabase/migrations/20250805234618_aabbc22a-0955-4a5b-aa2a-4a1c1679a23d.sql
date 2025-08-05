
-- Tabela para perguntas por conteúdo
CREATE TABLE content_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES conteudos(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'multiple_choice', 'true_false')),
  options JSONB, -- Para múltipla escolha: ["opção1", "opção2", "opção3", "opção4"]
  correct_answer TEXT, -- Para questões com resposta certa
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para progresso detalhado por conteúdo
CREATE TABLE user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID REFERENCES conteudos(id) ON DELETE CASCADE,
  watched_video BOOLEAN DEFAULT FALSE,
  read_text BOOLEAN DEFAULT FALSE,
  downloaded_pdf BOOLEAN DEFAULT FALSE,
  answered_questions BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0, -- em segundos
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Tabela para respostas às perguntas
CREATE TABLE user_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID REFERENCES content_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- RLS Policies para content_questions
ALTER TABLE content_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content questions" 
  ON content_questions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage content questions" 
  ON content_questions 
  FOR ALL 
  USING (is_admin());

-- RLS Policies para user_content_progress
ALTER TABLE user_content_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content progress" 
  ON user_content_progress 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own content progress" 
  ON user_content_progress 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own content progress" 
  ON user_content_progress 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- RLS Policies para user_question_responses
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own question responses" 
  ON user_question_responses 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own question responses" 
  ON user_question_responses 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own question responses" 
  ON user_question_responses 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Função para atualizar progresso da trilha baseado nos conteúdos concluídos
CREATE OR REPLACE FUNCTION update_track_progress()
RETURNS TRIGGER AS $$
DECLARE
  track_id_var UUID;
  total_contents INTEGER;
  completed_contents INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Pegar o ID da trilha do conteúdo
  SELECT trilha_id INTO track_id_var
  FROM conteudos 
  WHERE id = NEW.content_id;

  -- Contar total de conteúdos na trilha
  SELECT COUNT(*) INTO total_contents
  FROM conteudos 
  WHERE trilha_id = track_id_var;

  -- Contar conteúdos concluídos pelo usuário
  SELECT COUNT(*) INTO completed_contents
  FROM user_content_progress ucp
  JOIN conteudos c ON c.id = ucp.content_id
  WHERE c.trilha_id = track_id_var 
  AND ucp.user_id = NEW.user_id 
  AND ucp.completed = true;

  -- Calcular porcentagem
  progress_percentage = CASE 
    WHEN total_contents = 0 THEN 0 
    ELSE (completed_contents * 100) / total_contents 
  END;

  -- Atualizar ou inserir progresso da trilha
  INSERT INTO user_track_progress (user_id, track_id, progress, completed_at)
  VALUES (
    NEW.user_id, 
    track_id_var, 
    progress_percentage,
    CASE WHEN progress_percentage = 100 THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, track_id) 
  DO UPDATE SET 
    progress = progress_percentage,
    completed_at = CASE WHEN progress_percentage = 100 THEN now() ELSE user_track_progress.completed_at END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso da trilha quando conteúdo é concluído
CREATE TRIGGER trigger_update_track_progress
  AFTER INSERT OR UPDATE ON user_content_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_track_progress();

-- Adicionar constraint única na tabela user_track_progress se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_track_progress_user_id_track_id_key'
  ) THEN
    ALTER TABLE user_track_progress ADD CONSTRAINT user_track_progress_user_id_track_id_key UNIQUE (user_id, track_id);
  END IF;
END $$;
