# Anti-Geyser Frontend

Beautiful, educational frontend for the Anti-Geyser Rewards system.

## Features

- 🎬 **Interactive Demo** - Visual explanation of how the system works
- 💎 **Staking Interface** - Easy-to-use staking/withdrawal interface
- 📊 **Real-time Metrics** - Live position and rewards tracking
- 📚 **Educational Content** - Explains the mechanism step-by-step
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file:
```bash
cp .env.local.example .env.local
```

Update contract addresses in `.env.local` after deployment.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Home (`/`)
- Overview of the anti-geyser mechanism
- Key metrics and features
- Links to demo and staking

### Interactive Demo (`/demo`)
- Real-time visualization of reward distribution
- Three actor scenarios (Long-term LP, Moderate LP, Farmer)
- Step-by-step explanation of mechanisms
- Animated epoch progression

### Staking (`/stake`)
- Connect wallet interface
- Stake/withdraw LP tokens
- Claim rewards
- View position details
- Real-time balance updates

### Dashboard (`/dashboard`)
- Comprehensive position overview
- Historical reward charts
- Program statistics

### Admin (`/admin`)
- Program management (owner only)
- Create new programs
- Deposit rewards
- Finalize epochs

## Components

### `StakingInterface`
Reusable staking UI component with:
- Wallet connection
- Balance display
- Stake/withdraw forms
- Reward claiming
- Position details

### `useAntiGeyser` Hook
React hook for contract interactions:
```tsx
const {
  address,
  position,
  rewards,
  stake,
  withdraw,
  claim
} = useAntiGeyser();
```

## Integration with Local Blockchain

### 1. Start Anvil
```bash
anvil
```

### 2. Deploy Contracts
```bash
# In project root
./deploy-and-simulate.sh
```

### 3. Update .env.local
Copy the contract addresses from deployment output to `.env.local`

### 4. Start Frontend
```bash
npm run dev
```

### 5. Connect MetaMask
- Add Anvil network to MetaMask:
  - Network Name: Anvil Local
  - RPC URL: http://localhost:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

- Import test account:
  - Use private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
  - (Default Anvil account #0 with 10,000 ETH)

## Key Features Explained

### Time-Decay Visualization
The demo page shows how rewards decay exponentially for late joiners. Early LPs get 100% of the time multiplier, while late joiners face heavy penalties.

### Tenure Multiplier Display
Visual representation of how continuous holding builds a multiplier over time (2% per epoch, capped at 10 epochs).

### Churn Penalty Indicator
Clear warnings and tracking of withdrawal events that penalize farming behavior.

## Customization

### Styling
- Uses Tailwind CSS
- Customize in `tailwind.config.ts`
- Global styles in `app/globals.css`

### Contract Addresses
- Set in `.env.local`
- Also in `lib/contractHelpers.ts` as fallbacks

### Demo Scenarios
- Edit `app/demo/page.tsx`
- Modify the `scenarios` array

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_REWARDS_CONTRACT` | AntiGeyserRewards address | `0x9fE46736...` |
| `NEXT_PUBLIC_POOL_TOKEN` | Pool token address | `0xe7f1725E...` |
| `NEXT_PUBLIC_REWARD_TOKEN` | Reward token address | `0x5FbDB231...` |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint | `http://localhost:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID | `31337` |

## Troubleshooting

### "Cannot connect to contracts"
- Ensure Anvil is running
- Check contract addresses in `.env.local`
- Verify MetaMask is on correct network

### "Transaction failed"
- Check account has enough ETH for gas
- Verify you have pool tokens to stake
- Ensure program is active

### "Nonce too low"
- Reset MetaMask account (Settings > Advanced > Reset Account)
- Or restart Anvil for fresh state

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6
- **TypeScript**: Full type safety
- **React**: 18+ with hooks

## Contributing

The frontend is designed to be educational and demo-friendly. When adding features:

1. Keep explanations clear and visible
2. Add tooltips and help text
3. Show real-time feedback
4. Handle errors gracefully
5. Make it mobile-responsive

## License

MIT - See parent directory LICENSE file

## Links

- [Project Root](../)
- [Quick Start Guide](../QUICKSTART.md)
- [Enhancements](../ENHANCEMENTS.md)
- [Contract Documentation](../README.md)

