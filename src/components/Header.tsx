import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 w-8 h-8 bg-primary/30 blur-lg" />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-wider arcade-gradient-text">
              GMMC ARCADE
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Play • Earn • Dominate
            </p>
          </div>
        </div>

        {/* Wallet Connect */}
        <WalletConnect />
      </div>
    </motion.header>
  );
}
