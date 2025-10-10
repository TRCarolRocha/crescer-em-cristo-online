-- Phase 4: Add auto_renew and payment_method_id to subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- Phase 5: Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_settings
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage payment settings
CREATE POLICY "Super admins can manage payment settings"
ON payment_settings
FOR ALL
USING (is_super_admin());

-- Phase 5: Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL CHECK (template_key IN ('welcome-individual', 'welcome-church', 'rejection', 'expiration-warning', 'renewal-reminder')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage email templates
CREATE POLICY "Super admins can manage email templates"
ON email_templates
FOR ALL
USING (is_super_admin());

-- Phase 5: Create payment_settings_history table
CREATE TABLE IF NOT EXISTS payment_settings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id UUID REFERENCES payment_settings(id) ON DELETE CASCADE,
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL,
  qr_code_url TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_settings_history
ALTER TABLE payment_settings_history ENABLE ROW LEVEL SECURITY;

-- Only super admins can view payment settings history
CREATE POLICY "Super admins can view payment settings history"
ON payment_settings_history
FOR SELECT
USING (is_super_admin());

-- Create trigger for payment_settings history
CREATE OR REPLACE FUNCTION log_payment_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_settings_history (setting_id, pix_key, pix_type, qr_code_url, changed_by)
  VALUES (OLD.id, OLD.pix_key, OLD.pix_type, OLD.qr_code_url, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER payment_settings_history_trigger
BEFORE UPDATE ON payment_settings
FOR EACH ROW
EXECUTE FUNCTION log_payment_settings_change();

-- Insert default payment settings if none exist
INSERT INTO payment_settings (pix_key, pix_type, is_active)
VALUES ('seu-pix-aqui@email.com', 'email', true)
ON CONFLICT DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_key, subject, html_content, variables) VALUES
('welcome-individual', '🎉 Bem-vindo ao Hodos - Assinatura Individual Aprovada!', '<h1>Olá {{userName}}!</h1><p>Sua assinatura do plano {{planType}} foi aprovada com sucesso!</p>', '["userName", "planType"]'),
('welcome-church', '⛪ Bem-vindo ao Hodos - Assinatura Igreja Aprovada!', '<h1>Olá {{userName}}!</h1><p>A assinatura da sua igreja ({{planType}}) foi aprovada!</p><p>Link de convite: {{churchSlug}}</p>', '["userName", "planType", "churchSlug"]'),
('rejection', 'ℹ️ Atualização sobre sua assinatura Hodos', '<h1>Olá {{userName}}</h1><p>Infelizmente não pudemos aprovar sua assinatura do plano {{planType}}.</p><p>Motivo: {{rejectionReason}}</p><p>Código: {{confirmationCode}}</p>', '["userName", "planType", "rejectionReason", "confirmationCode"]'),
('expiration-warning', '⚠️ Sua assinatura Hodos está prestes a expirar', '<h1>Olá {{userName}}</h1><p>Sua assinatura do plano {{planType}} expira em {{daysLeft}} dias.</p><p>Renove agora para continuar com acesso total!</p>', '["userName", "planType", "daysLeft"]'),
('renewal-reminder', '🔔 Lembrete de Renovação - Hodos', '<h1>Olá {{userName}}</h1><p>Sua assinatura do plano {{planType}} expirou há {{daysExpired}} dias.</p><p>Renove agora para reativar seu acesso!</p>', '["userName", "planType", "daysExpired"]')
ON CONFLICT (template_key) DO NOTHING;