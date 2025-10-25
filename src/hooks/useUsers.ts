import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  church_id: string | null;
  church_name: string | null;
  church_slug: string | null;
  plan_type: string;
  subscription_status: string;
  roles: string[];
  created_at: string;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  individual_subscription_id?: string | null;
  individual_subscription_status?: string | null;
  individual_expires_at?: string | null;
  individual_plan_name?: string | null;
}

export const useUsers = (filters?: {
  searchTerm?: string;
  churchId?: string;
  planType?: string;
  role?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      // Get all profiles
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          church_id,
          subscription_id,
          phone,
          birth_date,
          address,
          created_at,
          churches(name, slug)
        `)
        .order('created_at', { ascending: false });

      // Apply church filter
      if (filters?.churchId && filters.churchId !== 'all') {
        query = query.eq('church_id', filters.churchId);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Get emails using edge function
      const { data: emailsData } = await supabase.functions.invoke('admin-get-user-emails', {
        body: { userIds: profiles.map(p => p.id) }
      });

      const emailsMap = new Map(
        emailsData?.emails?.map((e: any) => [e.id, e.email]) || []
      );

      // Get all roles for all users
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles.map(p => p.id));

      const rolesMap = new Map<string, string[]>();
      rolesData?.forEach(r => {
        const existing = rolesMap.get(r.user_id) || [];
        rolesMap.set(r.user_id, [...existing, r.role]);
      });

      // Get subscription info for each user
      const usersWithDetails: UserData[] = await Promise.all(
        profiles.map(async (profile) => {
          let planType = 'free';
          let subscriptionStatus = 'inactive';

          // Check church subscription first (priority)
          if (profile.church_id && profile.churches) {
            const { data: church } = await supabase
              .from('churches')
              .select('subscription_id')
              .eq('id', profile.church_id)
              .maybeSingle();

            if (church?.subscription_id) {
              const { data: churchSub } = await supabase
                .from('subscriptions')
                .select('status, plan_id, subscription_plans(plan_type)')
                .eq('id', church.subscription_id)
                .maybeSingle();

              if (churchSub) {
                planType = churchSub.subscription_plans?.plan_type || 'free';
                subscriptionStatus = churchSub.status;
              }
            }
          }

          // If no church subscription, check individual via profile.subscription_id FIRST
          if (planType === 'free' && profile.subscription_id) {
            const { data: individualSub } = await supabase
              .from('subscriptions')
              .select('status, plan_id, subscription_plans(plan_type)')
              .eq('id', profile.subscription_id)
              .eq('status', 'active')
              .maybeSingle();

            if (individualSub) {
              planType = individualSub.subscription_plans?.plan_type || 'free';
              subscriptionStatus = individualSub.status;
            }
          }

          // Get individual subscription info
          let individualSubId = null;
          let individualSubStatus = null;
          let individualExpiresAt = null;
          let individualPlanName = null;

          // Always fetch individual subscription info via profile.subscription_id
          if (profile.subscription_id) {
            const { data: individualSub } = await supabase
              .from('subscriptions')
              .select('id, status, expires_at, subscription_plans(name, plan_type)')
              .eq('id', profile.subscription_id)
              .maybeSingle();

            if (individualSub) {
              individualSubId = individualSub.id;
              individualSubStatus = individualSub.status;
              individualExpiresAt = individualSub.expires_at;
              individualPlanName = individualSub.subscription_plans?.name || null;
              
              // If still 'free', update with actual plan
              if (planType === 'free' && individualSub.status === 'active') {
                planType = individualSub.subscription_plans?.plan_type || 'free';
                subscriptionStatus = individualSub.status;
              }
            }
          }

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: String(emailsMap.get(profile.id) || 'N/A'),
            avatar_url: profile.avatar_url,
            church_id: profile.church_id,
            church_name: profile.churches?.name || null,
            church_slug: profile.churches?.slug || null,
            plan_type: planType,
            subscription_status: subscriptionStatus,
            roles: rolesMap.get(profile.id) || [],
            created_at: profile.created_at,
            phone: profile.phone,
            birth_date: profile.birth_date,
            address: profile.address,
            individual_subscription_id: individualSubId,
            individual_subscription_status: individualSubStatus,
            individual_expires_at: individualExpiresAt,
            individual_plan_name: individualPlanName,
          };
        })
      );

      // Apply filters
      let filteredUsers = usersWithDetails;

      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(u =>
          u.full_name?.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      }

      if (filters?.planType && filters.planType !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.plan_type === filters.planType);
      }

      if (filters?.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.roles.includes(filters.role));
      }

      if (filters?.status && filters.status !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.subscription_status === filters.status);
      }

      return filteredUsers;
    },
  });
};
