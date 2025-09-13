// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  try {
    // Prefer calling the DB function if it exists
    const { error: rpcError } = await supabase.rpc("expire_free_ads");
    if (rpcError) {
      console.warn("expire_free_ads RPC not available or failed, falling back to direct UPDATE:", rpcError.message);
      // Fallback: run direct UPDATE mirroring the SQL function's logic
      const { error: sqlError } = await supabase
        .from("product_submissions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("status", "approved")
        .or("package->>id.eq.free,package.is.null")
        .lte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      if (sqlError) {
        throw sqlError;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});


