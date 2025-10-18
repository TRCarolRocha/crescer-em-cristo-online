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

      // Step 1: Get user profile to find church_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', user.id)
        .maybeSingle();

      const userChurchId = profile?.church_id;

      // Step 2: Get active subscription (user's own OR church subscription)
      let query = supabase
        .from('subscriptions')
        .select('id, status, expires_at, plan_id, church_id, user_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // Build OR condition manually
      if (userChurchId) {
        query = query.or(`user_id.eq.${user.id},church_id.eq.${userChurchId}`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data: subscription } = await query.maybeSingle();

      if (!subscription) {
        return getDefaultAccess();
      }

      // Step 3: Get plan details separately
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('plan_type, max_members, max_admins')
        .eq('id', subscription.plan_id)
        .maybeSingle();

      // Fallback: infer plan type if plan fetch fails (RLS issue)
      let planType = plan?.plan_type;
      if (!planType) {
        // Infer from subscription structure
        if (subscription.church_id) {
          planType = 'church_simple'; // Fallback for church plans
        } else if (subscription.user_id) {
          planType = 'individual'; // Fallback for individual plans
        } else {
          planType = 'free';
        }
      }

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
        churchMemberLimit: plan?.max_members || null,
        churchAdminLimit: plan?.max_admins || null,
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
