# 🌊 Montropy

> **Capital-Efficient Rewards Engine that Discourages Transient Farming**

A novel liquidity mining rewards system that favors long-term, genuine liquidity providers over short-term "mercenary farmers" through time-decay curves, tenure multipliers, and behavioral penalties.

---

## 🎯 Problem

Traditional liquidity mining programs suffer from:
- **Mercenary farming**: LPs deposit right before epochs and withdraw immediately after
- **Unsustainable TVL**: Liquidity disappears when rewards stop
- **Inefficient capital**: Same rewards budget wasted on transient liquidity
- **Poor retention**: No incentive to stay long-term

## 💡 Solution

Montropy implements three key mechanisms:

### 1. **Time-Decay Curve**
Early joiners get full rewards; late joiners face exponential decay penalties
```
D_join(i, e) = 2^(-(joinEpoch) / halfLife)
```

### 2. **Tenure Multiplier**
Continuous holders earn increasing multipliers (e.g., +2% per epoch, capped at 10 epochs)
```
M_tenure(i, e) = 1 + alpha × min(tenure, T_max)
```

### 3. **Churn Penalty**
Frequent withdrawals reduce effective stake by up to 50%

# 🧰 Architecture

<img width="1024" height="1536" alt="ChatGPT Image Nov 1, 2025, 05_56_53 PM" src="https://github.com/user-attachments/assets/46af0109-98a7-4853-965b-78b1d31efc8c" />


---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry ([Installation](https://book.getfoundry.sh/getting-started/installation))

### 1. Install Dependencies
```bash
npm install
forge install
```

### 2. Run Tests
```bash
forge test -vv
```

All 16 tests should pass! ✅

### 3. Start Local Chain
```bash
# Terminal 1
anvil
```

### 4. Deploy Contracts
```bash
# Terminal 2
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 5. Setup Program
```bash
# Update .env with deployed addresses
cp .env.example .env
# Edit .env

# Create and fund program
forge script script/SetupProgram.s.sol:SetupProgram \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 6. Run Simulation
```bash
npm run simulate -- simulator/scenarios/sample.json
```

### 7. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 📋 Project Structure

```
.
├── src/
│   ├── AntiGeyserRewards.sol    # Core rewards engine
│   ├── RewardToken.sol           # ERC20 reward token
│   └── MockPool.sol              # Simple staking pool
├── test/
│   └── AntiGeyser.t.sol          # Comprehensive test suite
├── script/
│   ├── Deploy.s.sol              # Deployment script
│   └── SetupProgram.s.sol        # Program setup script
├── simulator/
│   ├── runScenario.js            # Scenario runner
│   ├── advanceEpoch.js           # Time manipulation
│   └── scenarios/
│       └── sample.json           # Demo scenario
├── frontend/
│   └── app/
│       ├── page.tsx              # Landing page
│       ├── admin/                # Admin panel
│       ├── stake/                # Staking interface
│       └── dashboard/            # Analytics dashboard
├── DEPLOYMENT.md                 # Detailed deployment guide
└── README.md                     # This file
```

---

## 🧪 Testing

```bash
# Run all tests
forge test -vv

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testLongTermLPEarnsMoreThanFarmer -vvv

# Coverage
forge coverage
```

### Key Tests
- ✅ Long-term LP earns 40x more than farmer (same stake)
- ✅ Decay multiplier reduces late joiner rewards
- ✅ Tenure multiplier increases over time (capped)
- ✅ Churn penalty reduces effective stake
- ✅ Epoch finalization and reward claiming

---

## 🎮 Demo Flow (for Judges)

### 30-Second Hero Demo

1. **Show Dashboard** → Anti-farm metrics showing 90% rewards to long-term LPs
2. **Run Simulation** → Live demonstration of farmer earning 40x less
3. **Adjust Parameters** → Change decay/multiplier and re-run
4. **Key Takeaway**: Same total rewards, but capital efficiency drastically improved

### 2-Minute Technical Demo

```bash
# 1. Deploy (15s)
npm run deploy:local

# 2. Create program (10s)
npm run setup:program

# 3. Run simulation (30s)
npm run simulate

# 4. Show results (1m)
- Open simulator/results.json
- Show frontend dashboard
- Highlight key metrics
```

---

## ⚙️ Configuration

Program parameters are highly configurable:

```typescript
{
  epochLength: 86400,        // 1 day (in seconds)
  rewardPerEpoch: 1000e18,   // 1000 tokens per epoch
  halfLife: 2,               // 50% penalty after 2 epochs
  alpha: 0.02e18,            // 2% boost per epoch (WAD-scaled)
  tMax: 10,                  // Max 20% boost at 10 epochs
  totalEpochs: 30            // 30-day program
}
```

---

## 📐 Math Formulas

### Effective Stake
```
LP_i_e = stake × M_tenure × D_join × (1 - churnPenalty)
```

### Reward per User
```
reward_i_e = R_e × LP_i_e / S_e

Where:
  R_e = Total rewards for epoch e
  LP_i_e = User's effective stake
  S_e = Sum of all effective stakes
```

### Tenure Multiplier
```
M_tenure = 1 + α × min(tenure, T_max)

Example: α=0.02, tenure=5 → 1.10x multiplier
```

### Decay Multiplier
```
D_join = 1 - (joinEpoch / (2 × halfLife))

Example: halfLife=2, join at epoch 4 → 0.0x (10% floor)
```

