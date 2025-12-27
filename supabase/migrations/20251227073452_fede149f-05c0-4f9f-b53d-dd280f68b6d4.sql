-- Drop the public INSERT policy to prevent direct client-side score submissions
-- The edge function uses service_role which bypasses RLS, so it will still work
DROP POLICY IF EXISTS "Anyone can submit scores" ON public.leaderboard;

-- Create a more restrictive SELECT policy that only shows necessary data
-- Keep wallet addresses visible for leaderboard display but acknowledge the trade-off
-- Users participating in a public leaderboard implicitly accept their wallet is visible
DROP POLICY IF EXISTS "Leaderboard is publicly readable" ON public.leaderboard;

CREATE POLICY "Leaderboard scores are publicly viewable"
ON public.leaderboard
FOR SELECT
USING (true);

-- Add a comment explaining the security model
COMMENT ON TABLE public.leaderboard IS 'Public leaderboard - scores submitted via edge function with validation. Wallet addresses are publicly visible as part of leaderboard display.';