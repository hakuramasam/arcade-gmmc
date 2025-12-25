import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Coins, Shield } from 'lucide-react';
import { Header } from '@/components/Header';
import { GameCanvas } from '@/components/GameCanvas';
import { PlayGame } from '@/components/PlayGame';
import { Leaderboard } from '@/components/Leaderboard';

const Index = () => {
  const [currentScore, setCurrentScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
  };

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setGameEnded(true);
  };

  const features = [
    {
      icon: Zap,
      title: 'Play to Earn',
      description: 'Score high and compete for $GMMC rewards',
    },
    {
      icon: Trophy,
      title: 'Global Leaderboard',
      description: 'Your scores are stored on-chain forever',
    },
    {
      icon: Shield,
      title: 'Base Network',
      description: 'Fast, cheap, and secure transactions',
    },
    {
      icon: Coins,
      title: '$GMMC Token',
      description: 'Use tokens to submit scores and earn more',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-4">
              <span className="arcade-gradient-text text-glow">ARCADE</span>
              <br />
              <span className="text-foreground">ON-CHAIN</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Play games, earn $GMMC tokens, and compete on the global leaderboard. 
              All scores stored permanently on Base network.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-xl bg-card/30 border border-border/50 backdrop-blur-sm text-center hover:border-primary/30 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-display text-sm text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Game Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Area - Takes 2 columns */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="mb-4">
                <h2 className="font-display text-2xl text-foreground mb-1">Target Blitz</h2>
                <p className="text-muted-foreground">Click targets to score points. Smaller = more points!</p>
              </div>
              <GameCanvas 
                onScoreUpdate={handleScoreUpdate} 
                onGameEnd={handleGameEnd}
              />
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* Submit Score */}
              {gameEnded && finalScore > 0 && (
                <PlayGame 
                  userScore={finalScore}
                  onSubmitSuccess={() => setGameEnded(false)}
                />
              )}

              {/* Leaderboard */}
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built on <span className="text-primary">Base</span> • Powered by <span className="text-secondary">$GMMC</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
