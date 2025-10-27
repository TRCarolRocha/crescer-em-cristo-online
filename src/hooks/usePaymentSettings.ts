import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentSettings = (planId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['payment-settings', planId],
    queryFn: async () => {
      let query = supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true);

      // Se planId for fornecido, buscar config específica do plano
      if (planId) {
        query = query.eq('plan_id', planId);
      } else {
        // Buscar configuração global (fallback)
        query = query.is('plan_id', null);
      }
      
      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Se não encontrou config específica e planId foi fornecido, buscar global
      if (!data && planId) {
        const { data: globalData, error: globalError } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('is_active', true)
          .is('plan_id', null)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (globalError) throw globalError;
        return globalData;
      }
      
      return data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (data: { 
      pix_key: string; 
      pix_type: string; 
      qr_code_url?: string; 
      pix_copia_cola?: string; 
      external_payment_link?: string;
      plan_id?: string 
    }) => {
      console.log('[UPDATE] Buscando config existente:', { plan_id: data.plan_id });
      
      // 1. BUSCAR CONFIG EXISTENTE
      let query = supabase
        .from('payment_settings')
        .select('id')
        .eq('is_active', true);
      
      if (data.plan_id) {
        query = query.eq('plan_id', data.plan_id);
      } else {
        query = query.is('plan_id', null);
      }
      
      const { data: existing, error: searchError } = await query
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (searchError) {
        console.error('[UPDATE] Erro ao buscar:', searchError);
        throw searchError;
      }
      
      if (!existing) {
        console.error('[UPDATE] Config não encontrada para plan_id:', data.plan_id);
        throw new Error('Configuração não encontrada. Por favor, crie uma nova configuração.');
      }
      
      console.log('[UPDATE] Config encontrada, ID:', existing.id);
      
      // 2. UPDATE DIRETO PELO ID
      const payload = {
        pix_key: data.pix_key,
        pix_type: data.pix_type,
        qr_code_url: data.qr_code_url,
        pix_copia_cola: data.pix_copia_cola,
        external_payment_link: data.external_payment_link,
        updated_at: new Date().toISOString()
      };
      
      console.log('[UPDATE] Payload:', payload);
      
      const { error: updateError } = await supabase
        .from('payment_settings')
        .update(payload)
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('[UPDATE] Erro ao atualizar:', updateError);
        throw updateError;
      }
      
      console.log('[UPDATE] Sucesso!');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings', variables.plan_id] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    }
  });

  const createSettings = useMutation({
    mutationFn: async (data: { 
      pix_key: string; 
      pix_type: string; 
      qr_code_url?: string; 
      pix_copia_cola?: string; 
      external_payment_link?: string;
      plan_id?: string 
    }) => {
      console.log('[CREATE] Dados recebidos:', data);
      
      // 1. DESATIVAR CONFIGS ANTIGAS DO MESMO TIPO
      let deactivateQuery = supabase
        .from('payment_settings')
        .update({ is_active: false });
      
      if (data.plan_id) {
        deactivateQuery = deactivateQuery.eq('plan_id', data.plan_id);
      } else {
        deactivateQuery = deactivateQuery.is('plan_id', null);
      }
      
      const { error: deactivateError } = await deactivateQuery;
      
      if (deactivateError) {
        console.error('[CREATE] Erro ao desativar configs antigas:', deactivateError);
        // Não bloquear criação se falhar
      } else {
        console.log('[CREATE] Configs antigas desativadas');
      }
      
      // 2. INSERIR NOVA CONFIG
      const payload = {
        pix_key: data.pix_key,
        pix_type: data.pix_type,
        qr_code_url: data.qr_code_url,
        pix_copia_cola: data.pix_copia_cola,
        external_payment_link: data.external_payment_link,
        plan_id: data.plan_id || null,
        is_active: true
      };
      
      console.log('[CREATE] Payload:', payload);
      
      const { error: insertError } = await supabase
        .from('payment_settings')
        .insert(payload);
      
      if (insertError) {
        console.error('[CREATE] Erro ao inserir:', insertError);
        throw insertError;
      }
      
      console.log('[CREATE] Sucesso!');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings', variables.plan_id] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    }
  });

  return { 
    settings, 
    isLoading, 
    error, 
    updateSettings: updateSettings.mutateAsync,
    createSettings: createSettings.mutateAsync 
  };
};
