import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAccess {
  planType: 'free' | 'individual' | 'church_simple' | 'church_plus' | 'church_premium';
  isActive: boolean;
  expiresAt: Date | null;
  canAccessTracks: boolean;
  canAccessProgress: boolean;
  canAccessPersonalDevotionals: boolean;
  canAccessPublicContent: boolean;
  canAccessGroups: boolean;
  canAccessChurchAdmin: boolean;
  canAccessChurchCustomization: boolean;
  churchMemberLimit: number | null;
  churchAdminLimit: number | null;
}

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
              .select('plan_type, max_members, max_admins')
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
            .select('plan_type, max_members, max_admins')
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

      return {
        planType,
        isActive: activeSubscription.status === 'active',
        expiresAt: activeSubscription.expires_at ? new Date(activeSubscription.expires_at) : null,
        canAccessTracks: planType !== 'free',
        canAccessProgress: planType !== 'free',
        canAccessPersonalDevotionals: planType !== 'free',
        canAccessPublicContent: true,
        canAccessGroups: planType.startsWith('church'),
        canAccessChurchAdmin: planType.startsWith('church'),
        canAccessChurchCustomization: planType === 'church_plus' || planType === 'church_premium',
        churchMemberLimit: activePlan.max_members || null,
        churchAdminLimit: activePlan.max_admins || null,
      } as SubscriptionAccess;
    },
  });

  return { access: access || getDefaultAccess(), isLoading, error, refetch };
};

function getDefaultAccess(): SubscriptionAccess {
  return {
    planType: 'free',
    isActive: false,
    expiresAt: null,
    canAccessTracks: false,
    canAccessProgress: false,
    canAccessPersonalDevotionals: false,
    canAccessPublicContent: true,
    canAccessGroups: false,
    canAccessChurchAdmin: false,
    canAccessChurchCustomization: false,
    churchMemberLimit: null,
    churchAdminLimit: null,
  };
}
