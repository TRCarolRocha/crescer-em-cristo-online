-- Create spiritual levels configuration table
CREATE TABLE public.spiritual_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  min_points INTEGER NOT NULL DEFAULT 0,
  min_time_months INTEGER NOT NULL DEFAULT 0,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 6 spiritual levels
INSERT INTO public.spiritual_levels (level_key, name, emoji, description, min_points, min_time_months, requirements) VALUES
('novo', 'Novo na Fé', '🌱', 'Você está no início da sua jornada espiritual', 0, 0, '{"activities": ["Cadastro inicial", "Responder 1º diagnóstico"]}'),
('aprendiz', 'Aprendiz', '🌾', 'Aprendendo os fundamentos da fé', 200, 6, '{"activities": ["Concluir 10 trilhas básicas", "Participar de 1 grupo"], "tracks_required": 10, "group_participation": true}'),
('crescimento', 'Em Crescimento', '🌿', 'Crescendo consistentemente na fé', 500, 12, '{"activities": ["Concluir +70% das trilhas", "Responder novo diagnóstico"], "track_completion_percentage": 70, "diagnostics_required": 2}'),
('consolidado', 'Consolidado', '🌳', 'Consolidando conhecimento e práticas espirituais', 1000, 18, '{"activities": ["Manter frequência em grupos", "Concluir 15 trilhas intermediárias"], "intermediate_tracks": 15, "group_frequency": true}'),
('mentor', 'Mentor', '🌺', 'Capacitado para orientar outros na fé', 1800, 24, '{"activities": ["Concluir todas as trilhas", "Liderar/auxiliar 1 grupo"], "all_tracks": true, "leadership_role": true}'),
('lider_maduro', 'Líder Maduro', '🌟', 'Liderança madura e discipulado ativo', 3000, 36, '{"activities": ["Concluir todas as trilhas", "3 diagnósticos consistentes", "Discipular pessoas"], "all_tracks": true, "diagnostics_required": 3, "discipleship": true}');

-- Create user spiritual points table
CREATE TABLE public.user_spiritual_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_total INTEGER NOT NULL DEFAULT 0,
  level_current TEXT NOT NULL DEFAULT 'novo',
  level_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_diagnostics INTEGER DEFAULT 0,
  points_tracks INTEGER DEFAULT 0,
  points_devotionals INTEGER DEFAULT 0,
  points_groups INTEGER DEFAULT 0,
  activities_completed JSONB DEFAULT '[]'::jsonb,
  streak_multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create level progression history table
CREATE TABLE public.level_progression_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_level TEXT,
  to_level TEXT NOT NULL,
  promoted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_at_promotion INTEGER NOT NULL,
  time_in_previous_level_months INTEGER
);

-- Enable RLS
ALTER TABLE public.spiritual_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spiritual_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_progression_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spiritual_levels
CREATE POLICY "Anyone can view spiritual levels" 
ON public.spiritual_levels 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage spiritual levels" 
ON public.spiritual_levels 
FOR ALL 
USING (is_admin());

-- RLS Policies for user_spiritual_points
CREATE POLICY "Users can view their own spiritual points" 
ON public.user_spiritual_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spiritual points" 
ON public.user_spiritual_points 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spiritual points" 
ON public.user_spiritual_points 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all spiritual points" 
ON public.user_spiritual_points 
FOR SELECT 
USING (is_admin());

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements" 
ON public.user_achievements 
FOR ALL 
USING (is_admin());

-- RLS Policies for level_progression_history
CREATE POLICY "Users can view their own progression history" 
ON public.level_progression_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progression history" 
ON public.level_progression_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progression history" 
ON public.level_progression_history 
FOR SELECT 
USING (is_admin());

-- Create triggers for timestamps
CREATE TRIGGER update_user_spiritual_points_updated_at
BEFORE UPDATE ON public.user_spiritual_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate and award points
CREATE OR REPLACE FUNCTION public.award_spiritual_points(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER,
  p_activity_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points INTEGER := 0;
  current_multiplier DECIMAL(3,2) := 1.00;
  final_points INTEGER;
  current_level TEXT;
  new_level TEXT;
  level_months INTEGER;
BEGIN
  -- Get current points and multiplier
  SELECT points_total, streak_multiplier, level_current, 
         EXTRACT(EPOCH FROM (now() - level_started_at)) / (30.44 * 24 * 3600) as months_in_level
  INTO current_points, current_multiplier, current_level, level_months
  FROM user_spiritual_points 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist, create record
  IF NOT FOUND THEN
    INSERT INTO user_spiritual_points (user_id, level_current, level_started_at)
    VALUES (p_user_id, 'novo', now());
    current_points := 0;
    current_multiplier := 1.00;
    current_level := 'novo';
    level_months := 0;
  END IF;
  
  -- Calculate final points with multiplier
  final_points := ROUND(p_points * current_multiplier);
  
  -- Update points based on activity type
  UPDATE user_spiritual_points 
  SET 
    points_total = points_total + final_points,
    points_diagnostics = CASE WHEN p_activity_type = 'diagnostic' THEN points_diagnostics + final_points ELSE points_diagnostics END,
    points_tracks = CASE WHEN p_activity_type = 'track' THEN points_tracks + final_points ELSE points_tracks END,
    points_devotionals = CASE WHEN p_activity_type = 'devotional' THEN points_devotionals + final_points ELSE points_devotionals END,
    points_groups = CASE WHEN p_activity_type = 'group' THEN points_groups + final_points ELSE points_groups END,
    activities_completed = activities_completed || jsonb_build_object(
      'type', p_activity_type,
      'points', final_points,
      'timestamp', now(),
      'data', p_activity_data
    ),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Check for level progression
  SELECT level_key INTO new_level
  FROM spiritual_levels
  WHERE (current_points + final_points) >= min_points 
    AND level_months >= min_time_months
  ORDER BY min_points DESC
  LIMIT 1;
  
  -- If level changed, update and log progression
  IF new_level IS NOT NULL AND new_level != current_level THEN
    UPDATE user_spiritual_points 
    SET 
      level_current = new_level,
      level_started_at = now()
    WHERE user_id = p_user_id;
    
    INSERT INTO level_progression_history (user_id, from_level, to_level, points_at_promotion, time_in_previous_level_months)
    VALUES (p_user_id, current_level, new_level, current_points + final_points, level_months);
  END IF;
  
  -- Record achievement
  INSERT INTO user_achievements (user_id, achievement_type, achievement_title, achievement_description, points_awarded, metadata)
  VALUES (
    p_user_id,
    p_activity_type,
    CASE p_activity_type
      WHEN 'diagnostic' THEN 'Diagnóstico Completado'
      WHEN 'track' THEN 'Trilha Concluída'
      WHEN 'devotional' THEN 'Devocional Completado'
      WHEN 'group' THEN 'Participação em Grupo'
      ELSE 'Atividade Completada'
    END,
    'Pontos conquistados por ' || p_activity_type,
    final_points,
    p_activity_data
  );
END;
$$;

-- Function to check level eligibility
CREATE OR REPLACE FUNCTION public.check_level_eligibility(p_user_id UUID, p_target_level TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_points INTEGER;
  user_months INTEGER;
  required_points INTEGER;
  required_months INTEGER;
BEGIN
  -- Get user current data
  SELECT points_total, 
         EXTRACT(EPOCH FROM (now() - level_started_at)) / (30.44 * 24 * 3600)
  INTO user_points, user_months
  FROM user_spiritual_points 
  WHERE user_id = p_user_id;
  
  -- Get level requirements
  SELECT min_points, min_time_months
  INTO required_points, required_months
  FROM spiritual_levels
  WHERE level_key = p_target_level;
  
  -- Check eligibility
  RETURN (user_points >= required_points AND user_months >= required_months);
END;
$$;