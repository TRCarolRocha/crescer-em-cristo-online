-- Create diagnostic milestones table
CREATE TABLE public.diagnostic_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  min_time_months INTEGER NOT NULL DEFAULT 0,
  is_horizontal_branch BOOLEAN NOT NULL DEFAULT false,
  parent_milestone_id UUID REFERENCES public.diagnostic_milestones(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progression tracks table (internal tracks within milestones)
CREATE TABLE public.progression_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  track_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  points_required INTEGER NOT NULL DEFAULT 0,
  activities_required JSONB DEFAULT '[]'::jsonb,
  unlocks_content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(milestone_id, order_index)
);

-- Create milestone connections table (defines progression paths)
CREATE TABLE public.milestone_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  to_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  connection_type TEXT NOT NULL DEFAULT 'linear', -- 'linear', 'branch', 'convergence'
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user journey state table
CREATE TABLE public.user_journey_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  current_track_id UUID REFERENCES public.progression_tracks(id),
  completed_milestones JSONB DEFAULT '[]'::jsonb,
  completed_tracks JSONB DEFAULT '[]'::jsonb,
  available_branches JSONB DEFAULT '[]'::jsonb,
  journey_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_progression_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diagnostic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diagnostic_milestones
CREATE POLICY "Anyone can view diagnostic milestones" 
ON public.diagnostic_milestones FOR SELECT USING (true);

CREATE POLICY "Admins can manage diagnostic milestones" 
ON public.diagnostic_milestones FOR ALL USING (is_admin());

-- RLS Policies for progression_tracks
CREATE POLICY "Anyone can view progression tracks" 
ON public.progression_tracks FOR SELECT USING (true);

CREATE POLICY "Admins can manage progression tracks" 
ON public.progression_tracks FOR ALL USING (is_admin());

-- RLS Policies for milestone_connections
CREATE POLICY "Anyone can view milestone connections" 
ON public.milestone_connections FOR SELECT USING (true);

CREATE POLICY "Admins can manage milestone connections" 
ON public.milestone_connections FOR ALL USING (is_admin());

-- RLS Policies for user_journey_state
CREATE POLICY "Users can view their own journey state" 
ON public.user_journey_state FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey state" 
ON public.user_journey_state FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey state" 
ON public.user_journey_state FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all journey states" 
ON public.user_journey_state FOR SELECT USING (is_admin());

-- Insert the 9 diagnostic milestones
INSERT INTO public.diagnostic_milestones (level_key, name, emoji, description, order_index, min_points, min_time_months) VALUES
('novo_na_fe', 'Novo na Fé', '🌱', 'Início da jornada espiritual, aprendendo os fundamentos da fé', 1, 0, 0),
('aprendiz', 'Aprendiz', '📖', 'Absorvendo conhecimento básico e desenvolvendo hábitos espirituais', 2, 100, 1),
('em_crescimento', 'Em Crescimento', '🌿', 'Crescimento consistente na fé e práticas espirituais', 3, 250, 2),
('frutifero', 'Frutífero', '🌳', 'Começando a dar frutos espirituais e influenciar outros', 4, 500, 4),
('lider_formacao', 'Líder em Formação', '👨‍🏫', 'Desenvolvendo capacidades de liderança e mentoria', 5, 800, 6),
('lider_maduro', 'Líder Maduro', '👑', 'Liderança estabelecida com múltiplas opções de especialização', 6, 1200, 9),
('mentor', 'Mentor', '🧭', 'Especialização em discipulado individual e desenvolvimento pessoal', 7, 1500, 12, true, (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro')),
('formador_lideres', 'Formador de Líderes', '🏛️', 'Especialização em desenvolvimento de lideranças', 7, 1500, 12, true, (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro')),
('multiplicador', 'Multiplicador', '🚀', 'Nível máximo: multiplicação de igrejas e movimentos', 8, 2000, 18);

-- Insert progression tracks for each milestone
-- Novo na Fé tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'novo_na_fe'), 'novo', 'Novo', 'Recém chegado à fé', 1, 0),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'novo_na_fe'), 'raizes', 'Raízes', 'Desenvolvendo raízes espirituais', 2, 50),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'novo_na_fe'), 'frutifero_inicial', 'Frutífero Inicial', 'Primeiros frutos espirituais', 3, 100);

-- Aprendiz tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'aprendiz'), 'aprendiz', 'Aprendiz', 'Absorvendo conhecimento básico', 1, 100),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'aprendiz'), 'discipulo', 'Discípulo', 'Caminhando como discípulo', 2, 175),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'aprendiz'), 'crescimento_inicial', 'Crescimento Inicial', 'Primeiros sinais de crescimento', 3, 250);

-- Em Crescimento tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'em_crescimento'), 'crescimento', 'Em Crescimento', 'Crescimento consistente', 1, 250),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'em_crescimento'), 'estavel', 'Estável', 'Base espiritual estável', 2, 350),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'em_crescimento'), 'preparacao_frutos', 'Preparação para Frutos', 'Preparando-se para dar frutos', 3, 500);

-- Frutífero tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'frutifero'), 'frutifero', 'Frutífero', 'Dando frutos espirituais', 1, 500),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'frutifero'), 'influenciador', 'Influenciador', 'Influenciando outros positivamente', 2, 650),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'frutifero'), 'preparacao_lideranca', 'Preparação para Liderança', 'Preparando-se para liderar', 3, 800);

-- Líder em Formação tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_formacao'), 'lider_formacao', 'Líder em Formação', 'Desenvolvendo liderança', 1, 800),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_formacao'), 'ativo_discipulado', 'Ativo no Discipulado', 'Ativo em processos de discipulado', 2, 1000),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_formacao'), 'auxiliar_lideranca', 'Auxiliar de Liderança', 'Auxiliando na liderança', 3, 1200);

-- Líder Maduro tracks (base para ramificações)
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro'), 'lider_maduro', 'Líder Maduro', 'Liderança madura estabelecida', 1, 1200);

-- Mentor tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'mentor'), 'mentor_iniciante', 'Mentor Iniciante', 'Começando na mentoria', 1, 1300),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'mentor'), 'mentor_experiente', 'Mentor Experiente', 'Mentoria experiente', 2, 1400),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'mentor'), 'mentor_avancado', 'Mentor Avançado', 'Mentoria avançada', 3, 1500);

-- Formador de Líderes tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'formador_lideres'), 'formador_iniciante', 'Formador Iniciante', 'Começando a formar líderes', 1, 1300),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'formador_lideres'), 'formador_experiente', 'Formador Experiente', 'Formação experiente de líderes', 2, 1400),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'formador_lideres'), 'formador_avancado', 'Formador Avançado', 'Formação avançada de líderes', 3, 1500);

-- Multiplicador tracks
INSERT INTO public.progression_tracks (milestone_id, track_key, name, description, order_index, points_required) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'multiplicador'), 'multiplicador', 'Multiplicador', 'Multiplicação de igrejas e movimentos', 1, 2000);

-- Create milestone connections (linear progression)
INSERT INTO public.milestone_connections (from_milestone_id, to_milestone_id, connection_type) VALUES
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'novo_na_fe'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'aprendiz'), 'linear'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'aprendiz'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'em_crescimento'), 'linear'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'em_crescimento'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'frutifero'), 'linear'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'frutifero'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_formacao'), 'linear'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_formacao'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro'), 'linear'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'mentor'), 'branch'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'lider_maduro'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'formador_lideres'), 'branch'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'mentor'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'multiplicador'), 'convergence'),
((SELECT id FROM public.diagnostic_milestones WHERE level_key = 'formador_lideres'), (SELECT id FROM public.diagnostic_milestones WHERE level_key = 'multiplicador'), 'convergence');

-- Create function to initialize user journey
CREATE OR REPLACE FUNCTION public.initialize_user_journey(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  initial_milestone_id UUID;
  initial_track_id UUID;
BEGIN
  -- Get initial milestone (Novo na Fé)
  SELECT id INTO initial_milestone_id
  FROM diagnostic_milestones 
  WHERE level_key = 'novo_na_fe';
  
  -- Get initial track
  SELECT id INTO initial_track_id
  FROM progression_tracks 
  WHERE milestone_id = initial_milestone_id 
  AND order_index = 1;
  
  -- Insert user journey state
  INSERT INTO user_journey_state (user_id, current_milestone_id, current_track_id)
  VALUES (p_user_id, initial_milestone_id, initial_track_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Create function to progress user journey
CREATE OR REPLACE FUNCTION public.progress_user_journey(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_state RECORD;
  next_track RECORD;
  next_milestone RECORD;
  user_points INTEGER := 0;
  progression_result jsonb := '{}';
BEGIN
  -- Get user's current state and points
  SELECT ujs.*, usp.points_total INTO current_state, user_points
  FROM user_journey_state ujs
  LEFT JOIN user_spiritual_points usp ON usp.user_id = ujs.user_id
  WHERE ujs.user_id = p_user_id;
  
  IF NOT FOUND THEN
    PERFORM initialize_user_journey(p_user_id);
    RETURN '{"initialized": true}';
  END IF;
  
  -- Check if user can progress to next track in current milestone
  SELECT pt.* INTO next_track
  FROM progression_tracks pt
  WHERE pt.milestone_id = current_state.current_milestone_id
  AND pt.order_index = (
    SELECT order_index + 1 
    FROM progression_tracks 
    WHERE id = current_state.current_track_id
  )
  AND user_points >= pt.points_required;
  
  -- If next track exists and user meets requirements
  IF FOUND THEN
    UPDATE user_journey_state 
    SET current_track_id = next_track.id,
        last_progression_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
    
    progression_result := jsonb_build_object(
      'type', 'track_progression',
      'new_track', next_track.name,
      'track_id', next_track.id
    );
  ELSE
    -- Check if user can progress to next milestone
    SELECT dm.* INTO next_milestone
    FROM diagnostic_milestones dm
    JOIN milestone_connections mc ON mc.to_milestone_id = dm.id
    WHERE mc.from_milestone_id = current_state.current_milestone_id
    AND user_points >= dm.min_points;
    
    IF FOUND THEN
      -- Get first track of next milestone
      SELECT pt.* INTO next_track
      FROM progression_tracks pt
      WHERE pt.milestone_id = next_milestone.id
      AND pt.order_index = 1;
      
      UPDATE user_journey_state 
      SET current_milestone_id = next_milestone.id,
          current_track_id = next_track.id,
          completed_milestones = completed_milestones || jsonb_build_object('milestone_id', current_state.current_milestone_id, 'completed_at', now()),
          last_progression_at = now(),
          updated_at = now()
      WHERE user_id = p_user_id;
      
      progression_result := jsonb_build_object(
        'type', 'milestone_progression',
        'new_milestone', next_milestone.name,
        'milestone_id', next_milestone.id,
        'new_track', next_track.name,
        'track_id', next_track.id
      );
    ELSE
      progression_result := jsonb_build_object(
        'type', 'no_progression',
        'message', 'Insufficient points for next progression'
      );
    END IF;
  END IF;
  
  RETURN progression_result;
END;
$$;