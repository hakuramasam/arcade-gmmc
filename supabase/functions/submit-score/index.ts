import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum theoretical score based on game mechanics:
// - 30 second game, targets every 800ms (~37 targets)
// - Max points per target: ~70 (smallest size)
// - Max combo multiplier: 5x
// - Theoretical max: ~13,000 points
// Adding buffer for edge cases
const MAX_VALID_SCORE = 15000;
const MIN_VALID_SCORE = 0;

// Rate limiting: max submissions per wallet per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { wallet_address, score, tx_hash, player_name } = await req.json();

    console.log(`Score submission attempt: wallet=${wallet_address}, score=${score}, tx_hash=${tx_hash}`);

    // Validate required fields
    if (!wallet_address || typeof wallet_address !== 'string') {
      console.error('Invalid wallet address:', wallet_address);
      return new Response(
        JSON.stringify({ error: 'Valid wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate wallet address format (basic Ethereum address validation)
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(wallet_address)) {
      console.error('Invalid wallet address format:', wallet_address);
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate score is a number within valid range
    if (typeof score !== 'number' || !Number.isInteger(score)) {
      console.error('Invalid score type:', typeof score, score);
      return new Response(
        JSON.stringify({ error: 'Score must be an integer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (score < MIN_VALID_SCORE || score > MAX_VALID_SCORE) {
      console.error(`Score out of valid range: ${score} (valid: ${MIN_VALID_SCORE}-${MAX_VALID_SCORE})`);
      return new Response(
        JSON.stringify({ error: `Score must be between ${MIN_VALID_SCORE} and ${MAX_VALID_SCORE}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tx_hash format if provided
    if (tx_hash && typeof tx_hash === 'string') {
      const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
      if (!txHashRegex.test(tx_hash)) {
        console.error('Invalid transaction hash format:', tx_hash);
        return new Response(
          JSON.stringify({ error: 'Invalid transaction hash format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_address', wallet_address.toLowerCase())
      .gte('created_at', windowStart);

    if (countError) {
      console.error('Rate limit check error:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (count !== null && count >= MAX_SUBMISSIONS_PER_WINDOW) {
      console.error(`Rate limit exceeded for wallet ${wallet_address}: ${count} submissions in window`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 submissions per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate player_name if provided
    let sanitizedPlayerName = null;
    if (player_name && typeof player_name === 'string') {
      // Trim and limit length
      sanitizedPlayerName = player_name.trim().slice(0, 50);
      // Remove any potentially dangerous characters
      sanitizedPlayerName = sanitizedPlayerName.replace(/[<>\"\'&]/g, '');
    }

    // Insert the score
    const { data, error } = await supabase.from('leaderboard').insert({
      wallet_address: wallet_address.toLowerCase(),
      score,
      tx_hash: tx_hash || null,
      player_name: sanitizedPlayerName,
    }).select().single();

    if (error) {
      console.error('Database insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save score to leaderboard' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Score successfully submitted: id=${data.id}, wallet=${wallet_address}, score=${score}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in submit-score function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
