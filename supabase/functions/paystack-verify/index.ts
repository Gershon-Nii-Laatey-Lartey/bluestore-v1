
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get plan configuration from database
const getPlanConfiguration = async (supabaseClient: any, planId: string) => {
  console.log('🔍 Fetching plan configuration for planId:', planId);
  
  // Try to find the specific package - remove the active filter to see if that's the issue
  const { data, error } = await supabaseClient
    .from('ad_packages')
    .select('*')
    .eq('id', planId)
    .single();

  console.log('🎯 Query result for planId:', planId);
  console.log('🎯 Data:', data);
  console.log('🎯 Error:', error);

  if (error || !data) {
    console.error('❌ Error fetching plan configuration for planId:', planId, 'Error:', error);
    
    // Let's try without the active filter
    const { data: allData, error: allError } = await supabaseClient
      .from('ad_packages')
      .select('*')
      .eq('id', planId);
    
    console.log('🔍 Trying without active filter - Data:', allData);
    console.log('🔍 Trying without active filter - Error:', allError);
    
    if (allData && allData.length > 0) {
      console.log('✅ Found package without active filter:', allData[0]);
      const packageData = allData[0];
      
      // Parse duration to days
      const durationMatch = packageData.duration.match(/(\d+)/);
      const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;
      
      return {
        name: packageData.name,
        price: packageData.price,
        duration: durationDays,
        adsAllowed: packageData.ads_allowed,
        plan_type: packageData.plan_type,
        billing_cycle: packageData.billing_cycle,
        is_subscription: packageData.is_subscription
      };
    }
    
    console.error('❌ Package not found in database, using fallback values');
    return { name: 'Unknown Plan', price: 0, duration: 30, adsAllowed: 1, plan_type: 'one_time' };
  }

  console.log('✅ Found plan configuration:', data);

  // Parse duration to days
  const durationMatch = data.duration.match(/(\d+)/);
  const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;
  
  return {
    name: data.name,
    price: data.price,
    duration: durationDays,
    adsAllowed: data.ads_allowed,
    plan_type: data.plan_type,
    billing_cycle: data.billing_cycle,
    is_subscription: data.is_subscription
  };
};

serve(async (req) => {
  console.log('🚀 PAYSTACK VERIFY FUNCTION CALLED - UPDATED VERSION 3.0 - COMPLETELY FIXED DATABASE LOOKUP');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Test database connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabaseClient
      .from('ad_packages')
      .select('id, name, active, plan_type')
      .limit(5);
    
    console.log('🔍 Database test result:', testData, testError);
    console.log('🔍 Available packages:', testData?.map(p => `${p.id} (active: ${p.active}, plan_type: ${p.plan_type})`));

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying payment with reference:', reference);

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData);
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transactionData = paystackData.data;
    console.log('Transaction data:', transactionData);
    
    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: transactionData.status === 'success' ? 'succeeded' : 'failed',
        provider_payment_id: transactionData.id.toString(),
        metadata: {
          ...transactionData,
          verified_at: new Date().toISOString(),
        },
      })
      .eq('provider_reference', reference)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment successful and has plan metadata, ALWAYS create a NEW subscription
    if (transactionData.status === 'success' && transactionData.metadata?.plan_id) {
      const planId = transactionData.metadata.plan_id;
      console.log('🎯 Creating NEW subscription for plan:', planId);
      console.log('📋 Transaction metadata:', transactionData.metadata);
      
      // CRITICAL DEBUG: Check if package exists in database
      const { data: packageCheck, error: packageError } = await supabaseClient
        .from('ad_packages')
        .select('*')
        .eq('id', planId)
        .single();
      
      console.log('🔍 PACKAGE CHECK RESULT:');
      console.log('🔍 Package ID being looked up:', planId);
      console.log('🔍 Package found in database:', packageCheck);
      console.log('🔍 Package lookup error:', packageError);
      
      // Also check all available packages
      const { data: allPackages, error: allError } = await supabaseClient
        .from('ad_packages')
        .select('id, name, active, plan_type')
        .eq('active', true);
      
      console.log('📦 ALL ACTIVE PACKAGES IN DATABASE:', allPackages);
      console.log('📦 All packages error:', allError);
      
      // Try to find the specific package without any filters
      const { data: rawPackage, error: rawError } = await supabaseClient
        .from('ad_packages')
        .select('*')
        .eq('id', planId);
      
      console.log('🔍 RAW PACKAGE LOOKUP (no filters):', rawPackage);
      console.log('🔍 RAW PACKAGE ERROR:', rawError);
      
      // Get plan configuration from database
      const planConfig = await getPlanConfiguration(supabaseClient, planId);
      
      // Use the plan_type from database (one_time or subscription)
      const planType = planConfig.plan_type;
      
      // Calculate dates for the NEW subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);
      
      // ALWAYS create a completely new subscription for EVERY purchase
      // This ensures each purchase is independent and tracked separately
      const subscriptionData = {
        user_id: user.id,
        plan_type: planType,
        plan_name: planConfig.name,
        plan_price: planConfig.price,
        duration_days: planConfig.duration,
        ads_allowed: planConfig.adsAllowed,
        ads_used: 0, // Always start with 0 ads used for new subscription
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        features: {},
        status: 'active',
        package_id: planId, // Store the actual package ID from ad_packages
        billing_cycle: planConfig.billing_cycle,
        is_subscription: planConfig.is_subscription
      };

      console.log('💾 Creating brand new subscription with data:', subscriptionData);
      console.log('💾 Plan config used:', planConfig);

      // Insert new subscription record - NEVER update existing ones
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('user_plan_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subscriptionError) {
        console.error('❌ Subscription creation error:', subscriptionError);
        console.error('❌ Subscription data that failed:', subscriptionData);
        // Don't fail the payment verification if subscription creation fails
        // The payment was successful, so we should still return success
        console.log('Payment verified successfully but subscription creation failed');
      } else {
        console.log('✅ Subscription created successfully:', subscription);
        
        // Update the payment record to link it with the new subscription
        await supabaseClient
          .from('payments')
          .update({
            subscription_id: subscription.id,
            metadata: {
              ...transactionData,
              verified_at: new Date().toISOString(),
              subscription_created: true,
              subscription_id: subscription.id
            }
          })
          .eq('provider_reference', reference)
          .eq('user_id', user.id);
      }
    }

    console.log('Payment verified successfully:', reference);

    const responseData = {
      ...paystackData,
      subscription_created: transactionData.status === 'success' && transactionData.metadata?.plan_id ? true : false,
      debug_info: {
        plan_id: transactionData.metadata?.plan_id,
        plan_config: transactionData.status === 'success' && transactionData.metadata?.plan_id ? await getPlanConfiguration(supabaseClient, transactionData.metadata.plan_id) : null
      }
    };

    console.log('🚀 FUNCTION RETURNING:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in paystack-verify:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
