import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  timestamp?: Date;
}

// Mock data for demonstration
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234567890abcdef1234567890abcdef12345678', score: 15420 },
  { rank: 2, address: '0xabcdef1234567890abcdef1234567890abcdef12', score: 12350 },
  { rank: 3, address: '0x9876543210fedcba9876543210fedcba98765432', score: 11200 },
  { rank: 4, address: '0xfedcba9876543210fedcba9876543210fedcba98', score: 9870 },
  { rank: 5, address: '0x1111222233334444555566667777888899990000', score: 8540 },
  { rank: 6, address: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555', score: 7230 },
  { rank: 7, address: '0x5555eeee4444dddd3333cccc2222bbbb1111aaaa', score: 6890 },
  { rank: 8, address: '0x0000999988887777666655554444333322221111', score: 5670 },
];

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
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-neon-yellow" />
        <h3 className="font-display text-xl text-foreground">Global Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {mockLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-primary/5 ${getRankStyle(entry.rank)}`}
          >
            {/* Rank */}
            <div className="w-10 flex items-center justify-center">
              {getRankIcon(entry.rank) || (
                <span className="font-display text-lg text-muted-foreground">#{entry.rank}</span>
              )}
            </div>

            {/* Address */}
            <div className="flex-1">
              <p className="font-mono text-sm text-foreground">{formatAddress(entry.address)}</p>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className={`font-display text-lg ${
                entry.rank === 1 ? 'text-neon-yellow text-glow' : 
                entry.rank <= 3 ? 'text-primary' : 'text-foreground'
              }`}>
                {entry.score.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More */}
      <div className="mt-4 pt-4 border-t border-border text-center">
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-display uppercase tracking-wider">
          View Full Leaderboard →
        </button>
      </div>
    </div>
  );
}
