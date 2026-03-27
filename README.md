# Dhanix - USDT BEP20 Staking Platform

Dhanix is a fully automated, decentralized-inspired staking platform built primarily over the Binance Smart Chain (BSC) Mainnet. Users can deposit USDT to their assigned unique wallets, create fixed-term staking pools with dynamic APY, and earn guaranteed interest.

## Core Features
1. **Automated Deposits:** A persistent cron job automatically confirms pending incoming USDT (BEP20) transactions by querying the BSC Mainnet in real-time.
2. **Dynamic Staking Pools:** Users can configure staking pools for durations equal to or greater than the minimum permitted by the platform's Admin. Interest rates and limits are completely dynamic.
3. **Automated Interest Payouts:** Another cron job calculates earned APY for mature pools down to the day and automatically credits the user's secure wallet.
4. **Automated Withdrawals:** Users can withdraw their USDT directly to any BSC wallet, handled securely via an automated dispatcher running via cron.
5. **3-Level Referral Rewards:** A sophisticated referral system that rewards users up to 3 levels deep for the first three pools created by their referrals.
6. **Admin System Health:** Real-time dashboard for monitoring database status, PM2 process health, and live execution logs.

---

## Tech Stack
* **Frontend:** Next.js 16 (React 19), App Router, Vanilla CSS
* **Backend:** Next.js API Routes, NextAuth.js
* **Database:** PostgreSQL (via Prisma v7 ORM)
* **Blockchain:** `ethers v6` connected to BSC Mainnet
* **Automation:** `node-cron` with `PM2` (`dhanix-cron`)
* **Environment Support:** Hardware-compatible Webpack engine for older CPUs.

---

## Quick Setup Guide
### Prerequisites
- Node.js (`v18` or `v20+` recommended)
- PostgreSQL Database
- PM2 (Install via `npm i -g pm2`)

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the required variables, specifically:
```env
# Database
DATABASE_URL="postgres://user:password@localhost:5432/dhanix"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Blockchain Configuration (BSC Mainnet)
NETWORK_MODE="mainnet"
BSC_RPC_URL="https://bsc-dataseed.binance.org/"
USDT_CONTRACT_ADDRESS="0x55d398326f99059fF775485246999027B3197955"

# Security setup (High Risk)
MAIN_WALLET_PRIVATE_KEY="YOUR_ADMIN_EXTERNAL_PAYOUT_WALLET_PRIVATE_KEY"
HD_WALLET_SEED="YOUR_WALLET_GENERATION_MNEMONIC"
```

### 2. Database Commands
```bash
# Push schema to the database
npx prisma db push

# (Optional) Seed the default settings into the DB
# (If applicable in your setup, otherwise defaults are dynamically served from lib/settings)
```

### 3. Application Build
```bash
# Install Modules
npm install

# Build Next.js 
npm run build
```

### 4. Running the Platform Locally
```bash
npm start
``` 

### 5. Running the Background Workers
In order to automatically process incoming deposits, pool maturities, and withdrawals, you must run the background cron process. We use `pm2` to ensure it restarts upon failure:

```bash
npm run cron:start
```

To manage the cron worker:
```bash
pm2 logs dhanix-cron     # View all blockchain interaction logs
pm2 reload dhanix-cron   # Reload after changes
pm2 stop dhanix-cron     # Pause automation
```

---

## Important Security Disclaimers
* **Store `HD_WALLET_SEED` securely:** Anyone with this seed phrase can access every single deposit wallet generated for your users.
* **Store `MAIN_WALLET_PRIVATE_KEY` securely:** This wallet dispenses user withdrawals. It must remain funded with enough BNB to cover transaction gas fees. If compromised, funds exist at risk.
* Avoid commiting `.env`!

## Design & Developed By
[Messi](https://messidev.vercel.app/)
