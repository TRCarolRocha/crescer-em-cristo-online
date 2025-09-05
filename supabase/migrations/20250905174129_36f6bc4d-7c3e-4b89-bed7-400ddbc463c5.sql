-- Fix security issues: Set secure search_path for all functions
CREATE OR REPLACE FUNCTION public.update_devocional_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_track_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;