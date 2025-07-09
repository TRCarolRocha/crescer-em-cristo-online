
-- Inserir a trilha "Dons Espirituais" na tabela discipleship_tracks
INSERT INTO public.discipleship_tracks (title, description, level, lessons, duration, difficulty, topics)
VALUES (
  'Dons Espirituais',
  'Descubra e desenvolva os dons que Deus te deu para edificar o corpo de Cristo',
  'crescimento',
  8,
  '6 semanas',
  'Intermediário',
  ARRAY['Dons espirituais', 'Ministério', 'Serviço', 'Edificação', 'Corpo de Cristo']
);

-- Atualizar o conteúdo existente para usar o ID correto da trilha recém-criada
UPDATE public.conteudos 
SET trilha_id = (
  SELECT id FROM public.discipleship_tracks 
  WHERE title = 'Dons Espirituais'
  LIMIT 1
)
WHERE titulo = 'O que são dons espirituais?';
