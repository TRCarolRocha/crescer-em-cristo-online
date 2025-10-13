-- Adicionar campos para Pix Copia e Cola e Link Externo
ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS pix_copia_cola TEXT,
ADD COLUMN IF NOT EXISTS external_payment_link TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_settings_plan_id 
ON payment_settings(plan_id) WHERE is_active = true;