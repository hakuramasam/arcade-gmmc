import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Zap } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-primary/30 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-display text-sm text-primary">{formatAddress(address)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            variant="neon"
            size="sm"
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            {connector.name}
          </Button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
