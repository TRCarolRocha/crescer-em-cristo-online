-- FASE 4: Chat Direto com Super Admin

-- Adicionar colunas na tabela mensagens
ALTER TABLE mensagens
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'church_leadership' 
  CHECK (message_type IN ('church_leadership', 'super_admin_support')),
ADD COLUMN IF NOT EXISTS parent_message_id uuid REFERENCES mensagens(id),
ADD COLUMN IF NOT EXISTS read_at timestamptz,
ADD COLUMN IF NOT EXISTS replied_at timestamptz,
ADD COLUMN IF NOT EXISTS subject text;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_type ON mensagens(message_type);
CREATE INDEX IF NOT EXISTS idx_mensagens_parent ON mensagens(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_read_at ON mensagens(read_at);

-- Política para Super Admin ver todas as mensagens de suporte
CREATE POLICY "Super admin can view all support messages"
ON mensagens FOR SELECT
USING (
  message_type = 'super_admin_support' AND is_super_admin()
);

-- Política para Super Admin responder mensagens de suporte
CREATE POLICY "Super admin can reply to support messages"
ON mensagens FOR INSERT
WITH CHECK (
  message_type = 'super_admin_support' AND 
  parent_message_id IS NOT NULL AND 
  is_super_admin()
);

-- Política para Super Admin marcar como lida
CREATE POLICY "Super admin can update support messages"
ON mensagens FOR UPDATE
USING (
  message_type = 'super_admin_support' AND is_super_admin()
);

-- Política para usuários enviarem mensagens de suporte
CREATE POLICY "Users can send support messages"
ON mensagens FOR INSERT
WITH CHECK (
  message_type = 'super_admin_support' AND 
  parent_message_id IS NULL AND 
  auth.uid() = remetente_id
);