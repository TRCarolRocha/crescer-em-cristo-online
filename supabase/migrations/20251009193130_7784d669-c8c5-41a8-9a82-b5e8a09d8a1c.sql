-- ============================================================================
-- PHASE 1: FOUNDATION - SUBSCRIPTION SYSTEM DATABASE STRUCTURE
-- ============================================================================

-- 1. CREATE ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE public.subscription_plan_type AS ENUM (
  'free',
  'individual', 
  'church_simple',
  'church_plus',
  'church_premium'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'expired',
  'cancelled',
  'pending'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- 2. CREATE SUBSCRIPTION_PLANS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type public.subscription_plan_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_members INTEGER,
  max_admins INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CREATE SUBSCRIPTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT subscription_owner_check CHECK (
    (user_id IS NOT NULL AND church_id IS NULL) OR 
    (user_id IS NULL AND church_id IS NOT NULL)
  )
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_church_id ON public.subscriptions(church_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. CREATE PENDING_PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE public.pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code TEXT NOT NULL UNIQUE,
  plan_type public.subscription_plan_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  church_data JSONB,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  status public.payment_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_payments_user_id ON public.pending_payments(user_id);
CREATE INDEX idx_pending_payments_status ON public.pending_payments(status);
CREATE INDEX idx_pending_payments_confirmation_code ON public.pending_payments(confirmation_code);

CREATE TRIGGER update_pending_payments_updated_at
  BEFORE UPDATE ON public.pending_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. POPULATE SUBSCRIPTION_PLANS WITH INITIAL DATA
-- ----------------------------------------------------------------------------
INSERT INTO public.subscription_plans (plan_type, name, description, price_monthly, max_members, max_admins, features) VALUES
(
  'free',
  'Plano Free',
  'Acesso básico a devocionais públicos',
  0.00,
  NULL,
  NULL,
  '["Devocionais públicos", "Conteúdo devocional básico"]'::jsonb
),
(
  'individual',
  'Plano Individual',
  'Trilhas de crescimento e progresso espiritual personalizado',
  29.90,
  1,
  NULL,
  '["Todas trilhas públicas", "Progresso individual", "Devocionais personalizados", "Pontuação e níveis espirituais"]'::jsonb
),
(
  'church_simple',
  'Igreja Simples',
  'Plano básico para igrejas pequenas',
  99.90,
  50,
  3,
  '["Até 50 membros", "3 administradores", "Painel básico", "Convite de membros", "Devocionais da igreja", "Avisos e agenda"]'::jsonb
),
(
  'church_plus',
  'Igreja Plus',
  'Plano intermediário com mais recursos',
  199.90,
  150,
  8,
  '["Até 150 membros", "8 administradores", "Personalização avançada", "Trilhas privadas", "Grupos de estudo", "Analytics básico", "Comunicação interna"]'::jsonb
),
(
  'church_premium',
  'Igreja Premium',
  'Plano completo com todos os recursos',
  399.90,
  NULL,
  NULL,
  '["Membros ilimitados", "Administradores ilimitados", "Personalização completa", "Trilhas privadas ilimitadas", "Analytics avançado", "Integração API", "Suporte prioritário", "Multi-campus"]'::jsonb
);

-- 6. ADD FIELDS TO CHURCHES TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE public.churches
  ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN cnpj TEXT,
  ADD COLUMN cpf TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN responsible_name TEXT,
  ADD COLUMN responsible_email TEXT,
  ADD COLUMN responsible_phone TEXT;

CREATE INDEX idx_churches_subscription_id ON public.churches(subscription_id);

-- 7. ADD FIELD TO PROFILES TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_subscription_id ON public.profiles(subscription_id);

-- 8. CREATE HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION public.generate_confirmation_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_date TEXT;
  random_suffix TEXT;
  confirmation_code TEXT;
  code_exists BOOLEAN;
BEGIN
  code_date := TO_CHAR(now(), 'YYYYMMDD');
  
  LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    confirmation_code := 'PAG-' || code_date || '-' || random_suffix;
    
    SELECT EXISTS(
      SELECT 1 FROM public.pending_payments 
      WHERE pending_payments.confirmation_code = confirmation_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN confirmation_code;
END;
$$;

-- Function to check content access based on subscription
CREATE OR REPLACE FUNCTION public.has_content_access(p_user_id UUID, p_content_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_subscription AS (
    SELECT sp.plan_type
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE (s.user_id = p_user_id OR s.church_id = (
      SELECT church_id FROM public.profiles WHERE id = p_user_id
    ))
    AND s.status = 'active'
    AND (s.expires_at IS NULL OR s.expires_at > now())
    ORDER BY 
      CASE sp.plan_type
        WHEN 'church_premium' THEN 5
        WHEN 'church_plus' THEN 4
        WHEN 'church_simple' THEN 3
        WHEN 'individual' THEN 2
        WHEN 'free' THEN 1
      END DESC
    LIMIT 1
  )
  SELECT CASE
    -- Free plan: only public devotionals
    WHEN (SELECT plan_type FROM user_subscription) = 'free' THEN
      p_content_type = 'devotional_public'
    
    -- Individual plan: tracks, devotionals, progress
    WHEN (SELECT plan_type FROM user_subscription) = 'individual' THEN
      p_content_type IN ('devotional_public', 'devotional_personal', 'track_public', 'progress')
    
    -- Church plans: all content
    WHEN (SELECT plan_type FROM user_subscription) IN ('church_simple', 'church_plus', 'church_premium') THEN
      true
    
    -- No subscription: only public content
    ELSE
      p_content_type = 'devotional_public'
  END
$$;

-- 9. CONFIGURE RLS POLICIES
-- ----------------------------------------------------------------------------

-- RLS for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (public.is_admin());

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_admin() OR
    public.is_church_admin(church_id)
  );

CREATE POLICY "System can insert subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (
    public.is_admin() OR
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (public.is_admin());

-- RLS for pending_payments
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending payments"
  ON public.pending_payments
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_admin()
  );

CREATE POLICY "Authenticated users can create pending payments"
  ON public.pending_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all pending payments"
  ON public.pending_payments
  FOR ALL
  USING (public.is_admin());