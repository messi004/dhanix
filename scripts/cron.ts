import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { sendTransactionNotification } from '../lib/email';

const prisma = new PrismaClient();

const USDT_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
];

const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY;

if (!privateKey) {
    console.error('❌ MAIN_WALLET_PRIVATE_KEY is missing in .env!');
    process.exit(1);
}

const wallet = new ethers.Wallet(privateKey, provider);
const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, wallet);

console.log('🚀 Dhanix Unified Cron Jobs Started!');
console.log('   - Deposits: Running every 2 minutes');
console.log('   - Withdrawals: Running every 3 minutes');

// ==========================================
// DEPOSIT CONFIRMATION CRON
// ==========================================
let isProcessingDeposits = false;
cron.schedule('*/2 * * * *', async () => {
    if (isProcessingDeposits) return;
    try {
        isProcessingDeposits = true;
        console.log('🔄 [DEPOSITS] Checking for pending deposits...');
        
        const pendingDeposits = await prisma.deposit.findMany({
            where: { status: 'PENDING' },
            include: { user: true },
        });

        if (pendingDeposits.length === 0) {
             console.log('✅ [DEPOSITS] No pending deposits found.');
             return;
        }

        console.log(`🔍 [DEPOSITS] Found ${pendingDeposits.length} pending deposit(s). Checking balances...`);
        const decimals = await usdtContract.decimals();

        for (const deposit of pendingDeposits) {
            try {
                const rawBalance = await usdtContract.balanceOf(deposit.address);
                const balance = parseFloat(ethers.utils.formatUnits(rawBalance, decimals));
                const expectedAmount = parseFloat(deposit.amount.toString());

                if (balance >= expectedAmount) {
                     console.log(`💰 [DEPOSITS] Deposit of ${expectedAmount} USDT confirmed for address ${deposit.address}!`);
                     await prisma.deposit.update({
                         where: { id: deposit.id },
                         data: { status: 'CONFIRMED', txHash: 'auto-confirmed-by-cron' },
                     });

                     await prisma.wallet.update({
                         where: { userId: deposit.userId },
                         data: { balance: { increment: deposit.amount } },
                     });

                     await prisma.transaction.create({
                         data: {
                             userId: deposit.userId, type: 'DEPOSIT', amount: deposit.amount,
                             referenceId: deposit.id, description: `Auto-confirmed Deposit of ${deposit.amount} USDT`,
                         },
                     });
                     await sendTransactionNotification(
                         deposit.user.email,
                         'DEPOSIT',
                         deposit.amount.toString(),
                         `Your deposit of ${deposit.amount} USDT has been automatically confirmed by the blockchain and credited to your wallet.`
                     );
                     console.log(`✅ [DEPOSITS] User wallet credited for deposit ${deposit.id}`);
                }
            } catch (err) {
                console.error(`❌ [DEPOSITS] Error processing deposit ${deposit.id}:`, err);
            }
        }
    } catch (error) {
        console.error('❌ [DEPOSITS] General Cron Job Error:', error);
    } finally {
        isProcessingDeposits = false;
    }
});

// ==========================================
// WITHDRAWAL PROCESSING CRON
// ==========================================
let isProcessingWithdrawals = false;
cron.schedule('*/3 * * * *', async () => {
    if (isProcessingWithdrawals) {
        console.log('⏳ [WITHDRAWALS] Previous batch is still processing, skipping this tick...');
        return;
    }

    try {
        isProcessingWithdrawals = true;
        console.log('🔄 [WITHDRAWALS] Checking for pending withdrawals...');
        
        const pendingWithdrawals = await prisma.withdraw.findMany({
            where: { status: 'PENDING' },
            include: { user: true },
        });

        if (pendingWithdrawals.length === 0) {
             console.log('✅ [WITHDRAWALS] No pending withdrawals found.');
             return;
        }

        console.log(`🔍 [WITHDRAWALS] Found ${pendingWithdrawals.length} pending withdrawal(s). Processing...`);
        const decimals = await usdtContract.decimals();
        
        for (const withdrawal of pendingWithdrawals) {
            try {
                console.log(`💸 [WITHDRAWALS] Attempting to dispatch ${withdrawal.amount} USDT to ${withdrawal.walletAddress}...`);
                const amountWei = ethers.utils.parseUnits(withdrawal.amount.toString(), decimals);
                
                const tx = await usdtContract.transfer(withdrawal.walletAddress, amountWei);
                console.log(`... [WITHDRAWALS] Transaction broadcasted with hash: ${tx.hash}`);
                
                const receipt = await tx.wait();
                
                if (receipt.status === 1) {
                    await prisma.withdraw.update({
                        where: { id: withdrawal.id },
                        data: { status: 'SENT', txHash: tx.hash }
                    });
                    await sendTransactionNotification(
                        withdrawal.user.email,
                        'WITHDRAWAL',
                        withdrawal.amount.toString(),
                        `Your withdrawal of ${withdrawal.amount} USDT to address ${withdrawal.walletAddress} has been successfully sent to the blockchain.`
                    );
                    console.log(`✅ [WITHDRAWALS] Success! txHash: ${tx.hash}`);
                } else {
                     throw new Error('Transaction reverted by EVM');
                }
            } catch (err: any) {
                console.error(`❌ [WITHDRAWALS] Error processing ${withdrawal.id}:`, err.message || err);
                
                await prisma.withdraw.update({
                     where: { id: withdrawal.id },
                     data: { status: 'FAILED' }
                });

                await prisma.wallet.update({
                     where: { userId: withdrawal.userId },
                     data: { balance: { increment: withdrawal.amount } }
                });

                await sendTransactionNotification(
                    withdrawal.user.email,
                    'REJECTED',
                    withdrawal.amount.toString(),
                    `Your withdrawal of ${withdrawal.amount} USDT failed to process on the blockchain and the amount has been refunded to your wallet.`
                );

                console.log(`🔄 [WITHDRAWALS] Refunded ${withdrawal.amount} to user ${withdrawal.userId}.`);
            }
        }
    } catch (error) {
        console.error('❌ [WITHDRAWALS] General Error:', error);
    } finally {
        isProcessingWithdrawals = false;
    }
});

// ==========================================
// POOL MATURITY CRON (Runs every hour)
// ==========================================
let isProcessingPools = false;
cron.schedule('0 * * * *', async () => {
    if (isProcessingPools) return;
    try {
        isProcessingPools = true;
        console.log('🔄 [POOLS] Checking for matured pools...');
        
        const now = new Date();
        const activePools = await prisma.pool.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { lte: now } // End date is in the past or exactly now
            },
            include: { user: true }
        });

        if (activePools.length === 0) {
            console.log('✅ [POOLS] No matured pools found to process at this time.');
            return;
        }

        console.log(`🔍 [POOLS] Found ${activePools.length} mature pool(s). Processing payouts...`);

        for (const pool of activePools) {
            try {
                const principal = parseFloat(pool.amount.toString());
                const annualRate = parseFloat(pool.interestRate.toString());
                const startDate = new Date(pool.startDate);
                const endDate = new Date(pool.endDate);
                
                // Calculate time in years precisely by calendar months to match the frontend promise
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
                const timeInYears = months / 12;
                const interestEarned = principal * (annualRate / 100) * timeInYears;
                const totalPayout = principal + interestEarned;

                console.log(`💸 [POOLS] Processing pool ${pool.id} for user ${pool.userId}. Principal: ${principal}, Interest: ${interestEarned.toFixed(2)}`);

                // Update pool status to completed
                await prisma.pool.update({
                    where: { id: pool.id },
                    data: { status: 'COMPLETED' },
                });

                // Credit the user's wallet with BOTH principal and interest
                await prisma.wallet.update({
                    where: { userId: pool.userId },
                    data: { balance: { increment: totalPayout } },
                });

                // Record the transaction (Interest and Principal Return)
                await prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        type: 'INTEREST',
                        amount: totalPayout,
                        referenceId: pool.id,
                        description: `Pool matured. Principal: ${principal} USDT, Interest: ${interestEarned.toFixed(2)} USDT`,
                    },
                });

                await sendTransactionNotification(
                    pool.user.email,
                    'INTEREST',
                    totalPayout.toFixed(2),
                    `Your staking pool of ${principal} USDT has successfully matured! Your principal plus ${interestEarned.toFixed(2)} USDT of interest has been credited to your wallet.`
                );

                console.log(`✅ [POOLS] Successfully disbursed ${totalPayout.toFixed(2)} USDT to user ${pool.userId}`);

            } catch (err: any) {
                console.error(`❌ [POOLS] Error processing pool ${pool.id}:`, err.message || err);
            }
        }
    } catch (error) {
        console.error('❌ [POOLS] General Cron Job Error:', error);
    } finally {
        isProcessingPools = false;
    }
});
