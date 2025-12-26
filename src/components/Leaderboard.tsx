import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  id: string;
  wallet_address: string;
  player_name: string | null;
  score: number;
  created_at: string;
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-neon-yellow" />;
    case 2:
      return <Medal className="w-5 h-5 text-foreground/70" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-neon-yellow/10 border-neon-yellow/30';
    case 2:
      return 'bg-foreground/5 border-foreground/20';
    case 3:
      return 'bg-amber-600/10 border-amber-600/30';
    default:
      return 'bg-muted/10 border-border';
  }
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leaderboard',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-neon-yellow" />
          <h3 className="font-display text-xl text-foreground">Global Leaderboard</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLeaderboard}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No scores yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const rank = index + 1;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-primary/5 ${getRankStyle(rank)}`}
              >
                {/* Rank */}
                <div className="w-10 flex items-center justify-center">
                  {getRankIcon(rank) || (
                    <span className="font-display text-lg text-muted-foreground">#{rank}</span>
                  )}
                </div>

                {/* Address */}
                <div className="flex-1">
                  <p className="font-mono text-sm text-foreground">
                    {entry.player_name || formatAddress(entry.wallet_address)}
                  </p>
                  {entry.player_name && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatAddress(entry.wallet_address)}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className={`font-display text-lg ${
                    rank === 1 ? 'text-neon-yellow text-glow' : 
                    rank <= 3 ? 'text-primary' : 'text-foreground'
                  }`}>
                    {entry.score.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View More */}
      {entries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors font-display uppercase tracking-wider">
            View Full Leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}
