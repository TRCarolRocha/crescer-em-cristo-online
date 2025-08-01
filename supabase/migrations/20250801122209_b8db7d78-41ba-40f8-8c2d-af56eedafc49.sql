
-- Tabela para estatísticas de devocionais dos usuários
CREATE TABLE public.devocional_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  streak_atual integer NOT NULL DEFAULT 0,
  melhor_streak integer NOT NULL DEFAULT 0,
  total_completados integer NOT NULL DEFAULT 0,
  ultimo_devocional date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.devocional_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para devocional_stats
CREATE POLICY "Users can view their own stats" 
  ON public.devocional_stats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
  ON public.devocional_stats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
  ON public.devocional_stats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Tabela para configurações de notificação
CREATE TABLE public.notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  email_notifications boolean NOT NULL DEFAULT true,
  notification_time time without time zone NOT NULL DEFAULT '07:00:00',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notification_settings
CREATE POLICY "Users can view their own notification settings" 
  ON public.notification_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" 
  ON public.notification_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
  ON public.notification_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para atualizar automaticamente as estatísticas quando um devocional é completado
CREATE OR REPLACE FUNCTION update_devocional_stats()
RETURNS TRIGGER AS $$
DECLARE
  yesterday_completed boolean := false;
  current_streak integer := 0;
BEGIN
  -- Verificar se completou devocional ontem para manter streak
  SELECT EXISTS(
    SELECT 1 FROM devocional_historico dh
    JOIN devocionais d ON d.id = dh.devocional_id
    WHERE dh.user_id = NEW.user_id 
    AND d.data = CURRENT_DATE - INTERVAL '1 day'
    AND dh.completado = true
  ) INTO yesterday_completed;

  -- Inserir ou atualizar estatísticas
  INSERT INTO devocional_stats (user_id, streak_atual, melhor_streak, total_completados, ultimo_devocional)
  VALUES (
    NEW.user_id,
    CASE WHEN yesterday_completed OR NOT EXISTS(SELECT 1 FROM devocional_stats WHERE user_id = NEW.user_id) THEN 1 ELSE 1 END,
    1,
    1,
    (SELECT data FROM devocionais WHERE id = NEW.devocional_id)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_completados = devocional_stats.total_completados + CASE WHEN NEW.completado AND NOT OLD.completado THEN 1 ELSE 0 END,
    streak_atual = CASE 
      WHEN NEW.completado AND NOT OLD.completado THEN
        CASE WHEN yesterday_completed OR devocional_stats.ultimo_devocional = CURRENT_DATE - INTERVAL '1 day' 
        THEN devocional_stats.streak_atual + 1 
        ELSE 1 END
      ELSE devocional_stats.streak_atual
    END,
    melhor_streak = GREATEST(
      devocional_stats.melhor_streak,
      CASE 
        WHEN NEW.completado AND NOT OLD.completado THEN
          CASE WHEN yesterday_completed OR devocional_stats.ultimo_devocional = CURRENT_DATE - INTERVAL '1 day'
          THEN devocional_stats.streak_atual + 1 
          ELSE 1 END
        ELSE devocional_stats.streak_atual
      END
    ),
    ultimo_devocional = CASE WHEN NEW.completado THEN (SELECT data FROM devocionais WHERE id = NEW.devocional_id) ELSE devocional_stats.ultimo_devocional END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estatísticas
CREATE TRIGGER update_devocional_stats_trigger
  AFTER INSERT OR UPDATE ON devocional_historico
  FOR EACH ROW EXECUTE FUNCTION update_devocional_stats();

-- Adicionar constraint único para user_id em devocional_stats
ALTER TABLE public.devocional_stats ADD CONSTRAINT devocional_stats_user_id_unique UNIQUE (user_id);

-- Adicionar constraint único para user_id em notification_settings  
ALTER TABLE public.notification_settings ADD CONSTRAINT notification_settings_user_id_unique UNIQUE (user_id);
