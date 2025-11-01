# Simulation Scenarios

This directory contains pre-built scenarios that demonstrate different aspects of the Anti-Geyser rewards mechanism.

## Available Scenarios

### 1. `sample.json` - Long-term LP vs Farmer
**Purpose**: Basic demonstration of anti-farming mechanism  
**Actors**: 3 (LongTermLP, Farmer, ModerateLP)  
**Key Insight**: Early commitment + holding = maximum rewards

```bash
npm run simulate
# or
node simulator/runScenario.js simulator/scenarios/sample.json
```

---

### 2. `whale-attack.json` - Capital Size vs Time
**Purpose**: Shows that early small LPs beat late whales  
**Actors**: 2 small early LPs (100 tokens each) + 1 late whale (10,000 tokens)  
**Key Insight**: Time-weighting matters more than capital size

```bash
npm run simulate:whale
```

**Expected Results**:
- Small early LPs get proportionally high rewards
- Whale enters epoch 7 with 100x capital but gets minimal rewards
- Demonstrates exponential decay favoring early entrants

---

### 3. `rapid-churner.json` - Churn Penalties
**Purpose**: Shows impact of repeated deposit/withdraw cycles  
**Actors**: 1 patient LP vs 1 rapid churner (3 cycles)  
**Key Insight**: Each withdrawal resets your position and accrues churn penalties

```bash
npm run simulate:churner
```

**Expected Results**:
- Patient LP captures vast majority of rewards
- Churner gets minimal/zero rewards despite providing liquidity
- Churn count directly reduces effective stake

---

### 4. `gradual-entry.json` - DCA vs Lump Sum
**Purpose**: Compares dollar-cost averaging vs early lump sum  
**Actors**: Lump sum LP (5000 at epoch 0) vs DCA LP (1000 every 2 epochs)  
**Key Insight**: Early lump sum beats gradual entry due to time decay

```bash
npm run simulate:dca
```

**Expected Results**:
- Lump sum LP gets significantly more rewards
- DCA strategy is penalized by time decay
- Earlier is always better in anti-geyser design

---

### 5. `late-exit.json` - Exit Timing Impact
**Purpose**: Shows how exit timing affects rewards  
**Actors**: 4 LPs exiting at epochs 3, 6, 9, and never  
**Key Insight**: Longer hold times = exponentially more rewards

```bash
npm run simulate:exit
```

**Expected Results**:
- Early exiter gets minimal rewards
- Each additional epoch held dramatically increases rewards
- Hodler captures the most rewards

---

## Creating Custom Scenarios

### Scenario Structure

```json
{
  "name": "Scenario Name",
  "description": "What this demonstrates",
  "program": {
    "epochs": 10,
    "epochLength": 86400,
    "R_per_epoch": 1000,
    "half_life": 2,
    "alpha": 0.02,
    "T_max": 10
  },
  "actors": [
    {
      "name": "ActorName",
      "deposits": [
        {"epoch": 0, "amount": 1000}
      ],
      "withdraws": [
        {"epoch": 5}
      ]
    }
  ]
}
```

### Parameters Explained

#### Program Parameters
- `epochs`: Total number of epochs (10 = 10 days with default settings)
- `epochLength`: Duration in seconds (86400 = 1 day)
- `R_per_epoch`: Rewards per epoch (1000 = 1000 tokens)
- `half_life`: Epochs for 50% decay (2 = rewards halve every 2 epochs)
- `alpha`: Tenure boost per epoch (0.02 = 2% boost per epoch held)
- `T_max`: Max tenure epochs (10 = cap at 10 epochs of tenure bonus)

#### Actor Parameters
- `name`: Unique identifier for the actor
- `deposits`: Array of `{epoch, amount}` - when they stake
- `withdraws`: Array of `{epoch}` or `{epoch, amount}` - when they exit

### Example Ideas

1. **Sybil Attack**: Multiple small wallets vs one large wallet
2. **Smart Farmer**: Optimally timed entries/exits
3. **Bear Market**: All LPs exit at same time
4. **Bull Market**: Gradual increase in participants
5. **Protocol TVL Growth**: Simulating real growth patterns

### Running Custom Scenarios

```bash
# Create your scenario
cat > simulator/scenarios/my-scenario.json << 'EOF'
{
  "name": "My Custom Test",
  ...
}
EOF

# Run it
node simulator/runScenario.js simulator/scenarios/my-scenario.json

# Visualize
npm run visualize
```

---

## Analyzing Results

After running a scenario:

1. **Check terminal output** for epoch-by-epoch progression
2. **Run visualization** with `npm run visualize`
3. **Review JSON** at `simulator/results.json`
4. **Compare metrics**:
   - Total rewards per actor
   - Effective stake over time
   - Churn count impact
   - Anti-farm effectiveness score

---

## Tips for Good Scenarios

1. **Start simple**: 2-3 actors, clear strategies
2. **Test extremes**: Very early vs very late, high churn vs no churn
3. **Real-world patterns**: Mimic actual user behavior
4. **Edge cases**: What if everyone exits? What if one whale dominates?
5. **Document well**: Clear names and descriptions

---

## Interpreting Anti-Farm Scores

| Score | Meaning |
|-------|---------|
| 90-100% | Excellent - Strong anti-farm protection |
| 70-90% | Good - Effective deterrent |
| 50-70% | Moderate - Some gaming possible |
| <50% | Weak - Needs parameter adjustment |

---

## Contributing Scenarios

Have an interesting scenario? Add it here and submit a PR!

Good scenarios demonstrate:
- Specific attack vectors
- Real-world behavior patterns
- Parameter sensitivity
- Edge cases

---

## Questions?

See `QUICKSTART.md` or `README.md` for more information.

