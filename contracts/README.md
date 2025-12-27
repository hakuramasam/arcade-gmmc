# GMMC Arcade Smart Contract

## Overview

Solidity smart contract for the GMMC Arcade game on Base network.

## Contract Details

- **Token**: GMMC Token (`0x3D9B15274E579411555FF1F96fE9E1ABf3Df4b07`)
- **Network**: Base (Chain ID: 8453) or Base Sepolia (Chain ID: 84532)
- **Solidity Version**: ^0.8.20

## Deployment via ThirdWeb

### 1. Go to ThirdWeb Deploy

Visit [ThirdWeb Deploy](https://thirdweb.com/deploy)

### 2. Upload Contract

Upload `GMMCArcade.sol` or paste the code directly.

### 3. Configure Constructor Parameters

| Parameter | Value |
|-----------|-------|
| `_gmmcToken` | `0x3D9B15274E579411555FF1F96fE9E1ABf3Df4b07` |
| `_treasury` | Your treasury wallet address |

### 4. Deploy to Base

- Select **Base** network (mainnet) or **Base Sepolia** (testnet)
- Connect your wallet and deploy

### 5. Update Frontend

After deployment, update `src/lib/wagmi.ts`:

```typescript
export const ARCADE_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS' as const;
```

## Contract Features

### For Players
- `play(uint256 score)` - Submit score and pay entry fee
- `getLeaderboard()` - View top scores
- `getPlayerStats(address)` - View player statistics

### For Admin
- `setEntryFee(uint256)` - Update entry fee
- `setRewardPoolPercentage(uint256)` - Update pool percentage
- `distributeRewards(address[], uint256[])` - Send rewards to winners
- `emergencyWithdraw()` - Emergency fund recovery

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Entry Fee | 100 GMMC | Cost per game |
| Pool % | 80% | Goes to reward pool |
| Treasury % | 20% | Goes to treasury |
| Max Leaderboard | 100 | Top entries stored |

## Security Features

- ReentrancyGuard protection
- Ownable access control
- Score validation (0-15,000 range)
- Input validation on all functions

## Dependencies

Install via npm for local development:
```bash
npm install @openzeppelin/contracts
```

Or use ThirdWeb's built-in OpenZeppelin imports.
