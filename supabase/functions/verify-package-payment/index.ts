
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const packageId = session.metadata?.package_id;
    const userId = session.metadata?.user_id;
    const companyId = session.metadata?.company_id;

    if (!packageId || !userId || !companyId) {
      throw new Error("Missing metadata in payment session");
    }

    // Fetch package details
    const { data: packageData, error: packageError } = await supabaseService
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      throw new Error("Package not found");
    }

    // Calculate package details
    let remainingClasses = null;
    let expiresAt = null;

    if (packageData.package_type === 'class_count') {
      remainingClasses = packageData.class_count;
    } else if (packageData.package_type === 'time_based') {
      const now = new Date();
      expiresAt = new Date(now.getTime() + packageData.duration_days * 24 * 60 * 60 * 1000);
    }

    // Create user package record
    const { error: insertError } = await supabaseService
      .from('user_packages')
      .insert({
        user_id: userId,
        package_id: packageId,
        company_id: companyId,
        stripe_payment_intent_id: session.payment_intent,
        remaining_classes: remainingClasses,
        expires_at: expiresAt?.toISOString(),
        is_active: true,
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      package: packageData,
      remaining_classes: remainingClasses,
      expires_at: expiresAt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in verify-package-payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
