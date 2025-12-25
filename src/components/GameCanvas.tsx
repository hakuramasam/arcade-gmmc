import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  color: 'cyan' | 'magenta' | 'yellow';
}

export function GameCanvas({ onScoreUpdate, onGameEnd }: GameCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [combo, setCombo] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const colors: Target['color'][] = ['cyan', 'magenta', 'yellow'];
    const size = Math.random() * 40 + 30;
    
    const newTarget: Target = {
      id: Date.now() + Math.random(),
      x: Math.random() * (rect.width - size - 40) + 20,
      y: Math.random() * (rect.height - size - 40) + 20,
      size,
      points: Math.floor((80 - size) / 10) * 10 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    
    setTargets(prev => [...prev.slice(-8), newTarget]);
  }, []);

  const handleTargetClick = useCallback((target: Target) => {
    const newCombo = combo + 1;
    const comboMultiplier = Math.min(newCombo, 5);
    const points = target.points * comboMultiplier;
    
    setScore(prev => {
      const newScore = prev + points;
      onScoreUpdate(newScore);
      return newScore;
    });
    setCombo(newCombo);
    setTargets(prev => prev.filter(t => t.id !== target.id));
  }, [combo, onScoreUpdate]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
  };

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) {
      if (isPlaying && timeLeft <= 0) {
        setIsPlaying(false);
        onGameEnd(score);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, onGameEnd]);

  // Spawn targets
  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(spawnTarget, 800);
    return () => clearInterval(spawnInterval);
  }, [isPlaying, spawnTarget]);

  // Combo decay
  useEffect(() => {
    if (!isPlaying || combo === 0) return;

    const decayTimer = setTimeout(() => {
      setCombo(0);
    }, 1500);

    return () => clearTimeout(decayTimer);
  }, [isPlaying, combo, targets]);

  // Remove old targets
  useEffect(() => {
    if (!isPlaying) return;

    const cleanupInterval = setInterval(() => {
      setTargets(prev => prev.slice(-6));
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, [isPlaying]);

  const getTargetColor = (color: Target['color']) => {
    switch (color) {
      case 'cyan': return 'bg-neon-cyan';
      case 'magenta': return 'bg-neon-magenta';
      case 'yellow': return 'bg-neon-yellow';
    }
  };

  const getTargetGlow = (color: Target['color']) => {
    switch (color) {
      case 'cyan': return 'shadow-[0_0_20px_hsl(180,100%,50%),0_0_40px_hsl(180,100%,50%,0.5)]';
      case 'magenta': return 'shadow-[0_0_20px_hsl(300,100%,60%),0_0_40px_hsl(300,100%,60%,0.5)]';
      case 'yellow': return 'shadow-[0_0_20px_hsl(45,100%,55%),0_0_40px_hsl(45,100%,55%,0.5)]';
    }
  };

  return (
    <div className="relative">
      {/* Game Stats Bar */}
      <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg bg-card/50 border border-border backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
            <p className="font-display text-2xl text-primary text-glow-cyan">{score.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
            <p className={`font-display text-2xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
              {timeLeft}s
            </p>
          </div>
          {combo > 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Combo</p>
              <p className="font-display text-2xl text-secondary text-glow-magenta">x{Math.min(combo, 5)}</p>
            </motion.div>
          )}
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button variant="arcade" size="lg" onClick={startGame} className="gap-2">
              <Play className="w-5 h-5" />
              Start Game
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={resetGame} className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border-2 border-primary/30 bg-card/30 backdrop-blur-sm grid-pattern"
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
        
        {!isPlaying && timeLeft === 30 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <Zap className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
              <h3 className="font-display text-2xl text-primary text-glow-cyan mb-2">Ready to Play?</h3>
              <p className="text-muted-foreground">Click the targets as fast as you can!</p>
              <p className="text-sm text-muted-foreground mt-1">Smaller targets = more points</p>
            </motion.div>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <h3 className="font-display text-4xl arcade-gradient-text mb-2">Game Over!</h3>
            <p className="text-xl text-foreground mb-1">Final Score</p>
            <p className="font-display text-5xl text-primary text-glow-cyan mb-6">{score.toLocaleString()}</p>
            <Button variant="arcade" size="lg" onClick={startGame}>
              Play Again
            </Button>
          </motion.div>
        )}

        {/* Targets */}
        {targets.map((target) => (
          <motion.button
            key={target.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTargetClick(target)}
            className={`absolute rounded-full cursor-pointer ${getTargetColor(target.color)} ${getTargetGlow(target.color)} transition-shadow`}
            style={{
              left: target.x,
              top: target.y,
              width: target.size,
              height: target.size,
            }}
          >
            <span className="font-display text-xs text-background font-bold">
              +{target.points}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
