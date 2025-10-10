import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAccess {
  planType: 'free' | 'individual' | 'church_simple' | 'church_plus' | 'church_premium';
  isActive: boolean;
  expiresAt: Date | null;
  canAccessTracks: boolean;
  canAccessProgress: boolean;
  canAccessPersonalDevotionals: boolean;
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

      // Get user's active subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          expires_at,
          plan_id,
          church_id,
          subscription_plans (
            plan_type,
            max_members,
            max_admins
          )
        `)
        .or(`user_id.eq.${user.id},church_id.in.(select church_id from profiles where id = '${user.id}')`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!subscription || !subscription.subscription_plans) {
        return getDefaultAccess();
      }

      const plan = subscription.subscription_plans as any;
      const planType = plan.plan_type;

      return {
        planType,
        isActive: subscription.status === 'active',
        expiresAt: subscription.expires_at ? new Date(subscription.expires_at) : null,
        canAccessTracks: planType !== 'free',
        canAccessProgress: planType !== 'free',
        canAccessPersonalDevotionals: planType !== 'free',
        canAccessGroups: planType.startsWith('church'),
        canAccessChurchAdmin: planType.startsWith('church'),
        canAccessChurchCustomization: planType === 'church_plus' || planType === 'church_premium',
        churchMemberLimit: plan.max_members,
        churchAdminLimit: plan.max_admins,
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
    canAccessGroups: false,
    canAccessChurchAdmin: false,
    canAccessChurchCustomization: false,
    churchMemberLimit: null,
    churchAdminLimit: null,
  };
}
