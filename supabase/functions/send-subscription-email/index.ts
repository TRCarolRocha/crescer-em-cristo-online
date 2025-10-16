import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { WelcomeIndividual } from "./_templates/welcome-individual.tsx";
import { WelcomeChurch } from "./_templates/welcome-church.tsx";
import { Rejection } from "./_templates/rejection.tsx";
import { PaymentPending } from "./_templates/payment-pending.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome-individual' | 'welcome-church' | 'rejection' | 'payment-pending';
  to?: string;
  userId?: string;
  userName?: string;
  planType?: string;
  churchSlug?: string;
  rejectionReason?: string;
  confirmationCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    let { type, to, userId, userName, planType, confirmationCode, rejectionReason, churchSlug } = emailRequest;

    // If userId is provided and to is not, fetch user email server-side
    if (userId && !to) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError) {
        console.error('Error fetching user email:', userError);
        throw new Error('Failed to fetch user email');
      }
      
      to = userData?.user?.email;
      if (!userName) {
        userName = userData?.user?.user_metadata?.full_name || 'Usuário';
      }
    }

    if (!to) {
      throw new Error('Recipient email (to) is required');
    }

    console.log("Email request processed:", { type, to, userName });

    let html: string;
    let subject: string;

    switch (emailRequest.type) {
      case 'welcome-individual':
        html = await renderAsync(
          React.createElement(WelcomeIndividual, {
            userName: userName || 'Usuário',
            planType: planType || 'individual',
          })
        );
        subject = "🎉 Bem-vindo ao Hodos - Assinatura Individual Aprovada!";
        break;

      case 'welcome-church':
        html = await renderAsync(
          React.createElement(WelcomeChurch, {
            userName: userName || 'Usuário',
            planType: planType || 'church_simple',
            churchSlug: churchSlug || '',
          })
        );
        subject = "⛪ Bem-vindo ao Hodos - Assinatura Igreja Aprovada!";
        break;

      case 'rejection':
        html = await renderAsync(
          React.createElement(Rejection, {
            userName: userName || 'Usuário',
            planType: planType || 'individual',
            rejectionReason: rejectionReason || '',
            confirmationCode: confirmationCode || '',
          })
        );
        subject = "ℹ️ Atualização sobre sua assinatura Hodos";
        break;

      case 'payment-pending':
        html = await renderAsync(
          React.createElement(PaymentPending, {
            userName: userName || 'Usuário',
            planType: planType || 'individual',
            confirmationCode: confirmationCode || '',
          })
        );
        subject = "📝 Pagamento Registrado - Hodos";
        break;

      default:
        throw new Error(`Invalid email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Hodos <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
