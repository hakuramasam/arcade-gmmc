-- Create leaderboard table for storing game scores
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  player_name TEXT,
  score INTEGER NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster score lookups
CREATE INDEX idx_leaderboard_score ON public.leaderboard (score DESC);
CREATE INDEX idx_leaderboard_wallet ON public.leaderboard (wallet_address);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can view the leaderboard (it's public)
CREATE POLICY "Leaderboard is publicly readable"
ON public.leaderboard
FOR SELECT
USING (true);

-- Anyone can submit scores (wallet verification happens on-chain)
CREATE POLICY "Anyone can submit scores"
ON public.leaderboard
FOR INSERT
WITH CHECK (true);

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;