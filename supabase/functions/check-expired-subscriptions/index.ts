import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    console.log("Checking for expired subscriptions...");

    // 1. Find subscriptions that expired today
    const { data: expiredToday, error: expiredError } = await supabase
      .from('subscriptions')
      .select('id, user_id, church_id, plan_id, subscription_plans(plan_type)')
      .eq('status', 'active')
      .lte('expires_at', now)
      .gte('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (expiredError) {
      console.error("Error finding expired subscriptions:", expiredError);
      throw expiredError;
    }

    // Update to expired status
    if (expiredToday && expiredToday.length > 0) {
      console.log(`Found ${expiredToday.length} subscriptions that expired today`);
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .in('id', expiredToday.map(s => s.id));

      if (updateError) {
        console.error("Error updating to expired:", updateError);
        throw updateError;
      }

      // TODO: Send expiration notification emails
    }

    // 2. Find subscriptions expired for more than 7 days
    const { data: expiredLong, error: longExpiredError } = await supabase
      .from('subscriptions')
      .select('id, user_id, church_id, plan_id, subscription_plans(plan_type)')
      .eq('status', 'expired')
      .lte('expires_at', sevenDaysAgo);

    if (longExpiredError) {
      console.error("Error finding long expired subscriptions:", longExpiredError);
      throw longExpiredError;
    }

    // Cancel and downgrade to free
    if (expiredLong && expiredLong.length > 0) {
      console.log(`Found ${expiredLong.length} subscriptions expired for > 7 days`);
      
      const { error: cancelError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: now
        })
        .in('id', expiredLong.map(s => s.id));

      if (cancelError) {
        console.error("Error cancelling subscriptions:", cancelError);
        throw cancelError;
      }

      // For individual subscriptions, remove subscription_id from profiles
      const individualSubs = expiredLong.filter(s => !s.church_id);
      if (individualSubs.length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_id: null })
          .in('id', individualSubs.map(s => s.user_id));

        if (profileError) {
          console.error("Error updating profiles:", profileError);
        }
      }

      // TODO: Send downgrade notification emails
    }

    // 3. Send warning emails for subscriptions expiring in 3 days
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: expiringSoon, error: expiringSoonError } = await supabase
      .from('subscriptions')
      .select('id, user_id, expires_at, subscription_plans(plan_type)')
      .eq('status', 'active')
      .lte('expires_at', threeDaysFromNow)
      .gte('expires_at', now);

    if (expiringSoon && expiringSoon.length > 0) {
      console.log(`Found ${expiringSoon.length} subscriptions expiring in 3 days`);
      // TODO: Send warning emails
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiredToday: expiredToday?.length || 0,
        cancelledOld: expiredLong?.length || 0,
        expiringSoon: expiringSoon?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-expired-subscriptions:", error);
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
