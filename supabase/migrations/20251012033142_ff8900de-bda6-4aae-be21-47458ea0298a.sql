-- Fase 1: Adicionar configurações de pagamento por plano

-- 1. Adicionar coluna plan_id (nullable para permitir configuração global como fallback)
ALTER TABLE payment_settings 
ADD COLUMN plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE;

-- 2. Criar índice único composto (um plano só pode ter uma config ativa)
CREATE UNIQUE INDEX idx_payment_settings_plan_active 
ON payment_settings(plan_id) 
WHERE is_active = true;

-- 3. Permitir NULL para configuração global (fallback quando plano não tem config)
-- Já está NULL por padrão

-- 4. Adicionar índice em profiles.church_id para melhorar performance de filtros
CREATE INDEX IF NOT EXISTS idx_profiles_church_id ON profiles(church_id);

COMMENT ON COLUMN payment_settings.plan_id IS 'ID do plano específico. NULL = configuração global (fallback)';
