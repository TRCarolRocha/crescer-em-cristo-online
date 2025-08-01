
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obter data de hoje
    const hoje = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    }).split('/').reverse().join('-');

    console.log('Checking for devotional on date:', hoje);

    // Verificar se há devocional para hoje
    const { data: devocionalData, error: devocionalError } = await supabaseClient
      .from('devocionais')
      .select('id, tema')
      .eq('data', hoje)
      .single();

    if (devocionalError || !devocionalData) {
      console.log('No devotional found for today');
      return new Response(
        JSON.stringify({ message: 'No devotional for today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar usuários que ainda não fizeram o devocional de hoje e têm notificações ativas
    const { data: usersData, error: usersError } = await supabaseClient
      .from('notification_settings')
      .select(`
        user_id,
        email_notifications,
        profiles!inner(full_name)
      `)
      .eq('email_notifications', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!usersData || usersData.length === 0) {
      console.log('No users with email notifications enabled');
      return new Response(
        JSON.stringify({ message: 'No users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para cada usuário, verificar se ainda não fez o devocional
    let emailsSent = 0;
    for (const userData of usersData) {
      // Verificar se já completou o devocional de hoje
      const { data: historicoData } = await supabaseClient
        .from('devocional_historico')
        .select('id')
        .eq('user_id', userData.user_id)
        .eq('devocional_id', devocionalData.id)
        .eq('completado', true)
        .maybeSingle();

      if (!historicoData) {
        // Usuário ainda não fez o devocional, enviar email
        // Aqui você integraria com um serviço de email como SendGrid, Resend, etc.
        console.log(`Would send email to user ${userData.user_id} for devotional: ${devocionalData.tema}`);
        emailsSent++;
      }
    }

    console.log(`Processed ${emailsSent} email notifications`);

    return new Response(
      JSON.stringify({ 
        message: `Processed ${emailsSent} devotional reminders`,
        devotional: devocionalData.tema,
        date: hoje
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-devotional-reminder function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
