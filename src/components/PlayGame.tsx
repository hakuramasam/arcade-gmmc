import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, Coins, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GMMC_TOKEN_ADDRESS, ARCADE_CONTRACT_ADDRESS, GMMC_ABI, ARCADE_ABI } from '@/lib/wagmi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlayGameProps {
  userScore: number;
  onSubmitSuccess?: () => void;
}

export function PlayGame({ userScore, onSubmitSuccess }: PlayGameProps) {
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState<'idle' | 'approving' | 'approved' | 'submitting' | 'success'>('idle');
  
  // Read reward pool balance from contract
  const { 
    data: rewardPoolBalance, 
    isLoading: isPoolLoading,
    refetch: refetchPool 
  } = useReadContract({
    address: GMMC_TOKEN_ADDRESS,
    abi: GMMC_ABI,
    functionName: 'balanceOf',
    args: [ARCADE_CONTRACT_ADDRESS],
  });

  // Format the balance for display
  const formattedPoolBalance = rewardPoolBalance 
    ? Number(formatUnits(rewardPoolBalance as bigint, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : '---';
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const { 
    data: approveHash, 
    writeContract: writeApprove, 
    isPending: isApprovePending,
    error: approveError 
  } = useWriteContract();

  const { 
    data: playHash, 
    writeContract: writePlay, 
    isPending: isPlayPending,
    error: playError 
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });

  const { isLoading: isPlayConfirming, isSuccess: isPlaySuccess } = useWaitForTransactionReceipt({ 
    hash: playHash 
  });

  const handleApprove = () => {
    setStep('approving');
    writeApprove({
      address: GMMC_TOKEN_ADDRESS,
      abi: GMMC_ABI,
      functionName: 'approve',
      args: [ARCADE_CONTRACT_ADDRESS, parseUnits('20000', 18)],
    } as any);
  };

  const handlePlay = () => {
    setStep('submitting');
    writePlay({
      address: ARCADE_CONTRACT_ADDRESS,
      abi: ARCADE_ABI,
      functionName: 'play',
      args: [BigInt(userScore)],
    } as any);
  };

  // Save score to database when blockchain transaction succeeds
  const saveScoreToDatabase = async () => {
    if (!address || hasSubmitted) return;
    
    const { error } = await supabase.from('leaderboard').insert({
      wallet_address: address,
      score: userScore,
      tx_hash: playHash,
    });

    if (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save score to leaderboard');
    } else {
      toast.success('Score saved to leaderboard!');
      setHasSubmitted(true);
    }
  };

  // Update step based on transaction status
  useEffect(() => {
    if (isApproveSuccess && step === 'approving') {
      setStep('approved');
    }
  }, [isApproveSuccess, step]);

  useEffect(() => {
    if (isPlaySuccess && step === 'submitting') {
      setStep('success');
      saveScoreToDatabase();
      onSubmitSuccess?.();
    }
  }, [isPlaySuccess, step]);

  const error = approveError || playError;

  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm text-center"
      >
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-xl text-foreground mb-2">Wallet Required</h3>
        <p className="text-muted-foreground">Connect your wallet to submit scores to the leaderboard.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card/50 border border-primary/20 backdrop-blur-sm border-glow"
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="font-display text-xl text-foreground">Submit to Leaderboard</h3>
      </div>

      {/* Score Display */}
      <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Your Score</p>
        <p className="font-display text-4xl text-primary text-glow-cyan">{userScore.toLocaleString()}</p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {/* Step 1: Approve */}
        <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
          step === 'approving' || isApproveConfirming 
            ? 'bg-primary/10 border border-primary/30' 
            : step === 'approved' || step === 'submitting' || step === 'success'
            ? 'bg-neon-green/10 border border-neon-green/30'
            : 'bg-muted/20 border border-border'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'approved' || step === 'submitting' || step === 'success'
              ? 'bg-neon-green text-background'
              : 'bg-muted text-muted-foreground'
          }`}>
            {step === 'approving' || isApproveConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === 'approved' || step === 'submitting' || step === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="font-display text-sm">1</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm text-foreground">Approve $GMMC</p>
            <p className="text-xs text-muted-foreground">Allow contract to use tokens</p>
          </div>
          {step === 'idle' && (
            <Button 
              variant="neon" 
              size="sm" 
              onClick={handleApprove}
              disabled={isApprovePending || userScore === 0}
            >
              {isApprovePending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
            </Button>
          )}
        </div>

        {/* Step 2: Submit */}
        <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
          step === 'submitting' || isPlayConfirming 
            ? 'bg-secondary/10 border border-secondary/30' 
            : step === 'success'
            ? 'bg-neon-green/10 border border-neon-green/30'
            : 'bg-muted/20 border border-border'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'success'
              ? 'bg-neon-green text-background'
              : 'bg-muted text-muted-foreground'
          }`}>
            {step === 'submitting' || isPlayConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="font-display text-sm">2</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm text-foreground">Pay & Submit Score</p>
            <p className="text-xs text-muted-foreground">Send score to blockchain</p>
          </div>
          {step === 'approved' && (
            <Button 
              variant="arcade" 
              size="sm" 
              onClick={handlePlay}
              disabled={isPlayPending}
            >
              {isPlayPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {(isApproveConfirming || isPlayConfirming) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30"
          >
            <Loader2 className="w-4 h-4 text-neon-yellow animate-spin" />
            <p className="text-sm text-neon-yellow">Waiting for Base network confirmation...</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/10 border border-neon-green/30"
          >
            <Check className="w-4 h-4 text-neon-green" />
            <p className="text-sm text-neon-green">Score submitted! You're on the leaderboard!</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Pool */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-neon-yellow/10 via-secondary/10 to-primary/10 border border-neon-yellow/30">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Reward Pool</p>
            <button 
              onClick={() => refetchPool()} 
              className="text-muted-foreground hover:text-neon-yellow transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`w-3 h-3 ${isPoolLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="font-display text-2xl text-neon-yellow text-glow">
            {isPoolLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `${formattedPoolBalance} $GMMC`
            )}
          </p>
        </div>
      </div>

      {/* Token Info */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Coins className="w-3 h-3" />
        <span>Cost: 20,000 $GMMC to submit score</span>
      </div>
    </motion.div>
  );
}
