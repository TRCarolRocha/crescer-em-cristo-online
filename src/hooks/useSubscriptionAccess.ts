import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAccess {
  // Identificação
  planType: 'free' | 'individual' | 'church_simple' | 'church_plus' | 'church_premium';
  planTier: 'peregrino' | 'discipulo' | 'guia' | 'comunidade' | 'missao' | 'farol';
  planName: string;
  isActive: boolean;
  expiresAt: Date | null;
  
  // Conteúdos básicos
  canAccessTracks: boolean;
  canAccessProgress: boolean;
  canAccessPersonalDevotionals: boolean;
  canAccessPublicContent: boolean;
  
  // Trilhas avançadas
  canCreateOwnTracks: boolean;
  canShareTracks: boolean;
  canAccessDiscipleshipTracks: boolean;
  
  // Grupos
  canJoinGroups: boolean;
  canCreateSmallGroup: boolean;
  canManageGroupProgress: boolean;
  canAccessGroups: boolean;
  canAccessCells: boolean;
  
  // Admin
  canAccessChurchAdmin: boolean;
  canAccessChurchCustomization: boolean;
  
  // Avançado
  canAccessBasicReports: boolean;
  canAccessAdvancedReports: boolean;
  canManageMultipleCampuses: boolean;
  canManageFinances: boolean;
  canAccessPrioritySupport: boolean;
  
  // Limites
  churchMemberLimit: number | null;
  churchAdminLimit: number | null;
  smallGroupMemberLimit: number | null;
}

function determinePlanTier(
  planType: string, 
  priceMonthly: number
): SubscriptionAccess['planTier'] {
  if (planType === 'free') return 'peregrino';
  
  if (planType === 'individual') {
    // Diferenciar Discípulo (9.90) de Guia (19.90) pelo preço
    return priceMonthly >= 15 ? 'guia' : 'discipulo';
  }
  
  if (planType === 'church_simple') return 'comunidade';
  if (planType === 'church_plus') return 'missao';
  if (planType === 'church_premium') return 'farol';
  
  return 'peregrino'; // fallback
}

const PLAN_NAMES: Record<SubscriptionAccess['planTier'], string> = {
  peregrino: 'Hodos Peregrino',
  discipulo: 'Hodos Discípulo',
  guia: 'Hodos Guia',
  comunidade: 'Hodos Comunidade',
  missao: 'Hodos Missão',
  farol: 'Hodos Farol'
};

export const useSubscriptionAccess = () => {
  const { data: access, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-access'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return getDefaultAccess();
      }

      // Step 1: Get user profile with church info
      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id, subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        return getDefaultAccess();
      }

      // Step 2: Get church subscription if user belongs to a church
      let churchSubscription = null;
      let churchPlan = null;
      
      if (profile.church_id) {
        const { data: church } = await supabase
          .from('churches')
          .select('subscription_id')
          .eq('id', profile.church_id)
          .maybeSingle();

        if (church?.subscription_id) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id, status, expires_at, plan_id')
            .eq('id', church.subscription_id)
            .maybeSingle();

          if (sub && sub.status === 'active') {
            churchSubscription = sub;
            
            // Get church plan details
            const { data: plan } = await supabase
              .from('subscription_plans')
              .select('plan_type, max_members, max_admins, price_monthly')
              .eq('id', sub.plan_id)
              .maybeSingle();
            
            churchPlan = plan;
          }
        }
      }

      // Step 3: Get individual subscription if exists
      let individualSubscription = null;
      let individualPlan = null;

      if (profile.subscription_id) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('id, status, expires_at, plan_id')
          .eq('id', profile.subscription_id)
          .maybeSingle();

        if (sub && sub.status === 'active') {
          individualSubscription = sub;
          
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('plan_type, max_members, max_admins, price_monthly')
            .eq('id', sub.plan_id)
            .maybeSingle();
          
          individualPlan = plan;
        }
      }

      // Step 4: Prioritize church subscription over individual
      const activeSubscription = churchSubscription || individualSubscription;
      const activePlan = churchPlan || individualPlan;

      if (!activeSubscription || !activePlan) {
        return getDefaultAccess();
      }

      const planType = activePlan.plan_type;
      const priceMonthly = Number(activePlan.price_monthly || 0);
      const planTier = determinePlanTier(planType, priceMonthly);

      return {
        // Identificação
        planType,
        planTier,
        planName: PLAN_NAMES[planTier],
        isActive: activeSubscription.status === 'active',
        expiresAt: activeSubscription.expires_at ? new Date(activeSubscription.expires_at) : null,

        // Conteúdos básicos
        canAccessPublicContent: true,
        canAccessPersonalDevotionals: planType !== 'free',
        canAccessTracks: planType !== 'free',
        canAccessProgress: planType !== 'free',

        // Trilhas avançadas
        canCreateOwnTracks: planTier === 'guia' || planType.startsWith('church'),
        canShareTracks: planTier === 'guia' || planType.startsWith('church'),
        canAccessDiscipleshipTracks: planTier === 'missao' || planTier === 'farol',

        // Grupos
        canJoinGroups: true,
        canCreateSmallGroup: planTier === 'guia',
        canManageGroupProgress: planTier === 'guia' || planType.startsWith('church'),
        canAccessGroups: planType.startsWith('church'),
        canAccessCells: planTier === 'missao' || planTier === 'farol',

        // Admin
        canAccessChurchAdmin: planType.startsWith('church'),
        canAccessChurchCustomization: planTier === 'missao' || planTier === 'farol',

        // Avançado
        canAccessBasicReports: planTier === 'missao' || planTier === 'farol',
        canAccessAdvancedReports: planTier === 'farol',
        canManageMultipleCampuses: planTier === 'farol',
        canManageFinances: planTier === 'farol',
        canAccessPrioritySupport: planTier === 'farol',

        // Limites
        churchMemberLimit: activePlan.max_members || null,
        churchAdminLimit: activePlan.max_admins || null,
        smallGroupMemberLimit: planTier === 'guia' ? 10 : null,
      } as SubscriptionAccess;
    },
  });

  return { access: access || getDefaultAccess(), isLoading, error, refetch };
};

function getDefaultAccess(): SubscriptionAccess {
  return {
    // Identificação
    planType: 'free',
    planTier: 'peregrino',
    planName: 'Hodos Peregrino',
    isActive: false,
    expiresAt: null,
    
    // Conteúdos básicos
    canAccessPublicContent: true,
    canAccessPersonalDevotionals: false,
    canAccessTracks: false,
    canAccessProgress: false,
    
    // Trilhas avançadas
    canCreateOwnTracks: false,
    canShareTracks: false,
    canAccessDiscipleshipTracks: false,
    
    // Grupos
    canJoinGroups: false,
    canCreateSmallGroup: false,
    canManageGroupProgress: false,
    canAccessGroups: false,
    canAccessCells: false,
    
    // Admin
    canAccessChurchAdmin: false,
    canAccessChurchCustomization: false,
    
    // Avançado
    canAccessBasicReports: false,
    canAccessAdvancedReports: false,
    canManageMultipleCampuses: false,
    canManageFinances: false,
    canAccessPrioritySupport: false,
    
    // Limites
    churchMemberLimit: null,
    churchAdminLimit: null,
    smallGroupMemberLimit: null,
  };
}
