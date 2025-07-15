
-- Criar tabela para comentários nas mensagens
CREATE TABLE public.message_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela de comentários
ALTER TABLE public.message_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentários
CREATE POLICY "Anyone can view comments" 
ON public.message_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.message_comments 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments" 
ON public.message_comments 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" 
ON public.message_comments 
FOR DELETE 
USING (auth.uid() = author_id);

-- Verificar se o bucket para imagens existe, caso contrário criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images', 
  'message-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para permitir upload de imagens
CREATE POLICY "Users can upload message images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view message images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'message-images');

CREATE POLICY "Users can delete own message images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'message-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
