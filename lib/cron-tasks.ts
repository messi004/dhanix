import prisma from './prisma';
import { ethers, JsonRpcProvider, formatUnits, parseUnits } from 'ethers';
import { sendTransactionNotification } from './email';

const USDT_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
];

const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY;

const getContract = () => {
    if (!privateKey) {
        throw new Error('MAIN_WALLET_PRIVATE_KEY is missing');
    }
    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, wallet);
};

export async function processDeposits() {
    console.log('🔄 [DEPOSITS] Checking for pending deposits...');
    const usdtContract = getContract();
    
    const pendingDeposits = await prisma.deposit.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
    });

    if (pendingDeposits.length === 0) {
        return { message: 'No pending deposits found' };
    }

    let confirmedCount = 0;
    const decimals = await usdtContract.decimals();

    for (const deposit of pendingDeposits) {
        try {
            const rawBalance = await usdtContract.balanceOf(deposit.address);
            const balance = parseFloat(formatUnits(rawBalance, decimals));
            const expectedAmount = parseFloat(deposit.amount.toString());

            if (balance >= expectedAmount) {
                // Find actual transaction hash from the blockchain
                let actualTxHash = 'auto-confirmed-by-cron';
                try {
                    const filter = usdtContract.filters.Transfer(null, deposit.address);
                    const logs = await usdtContract.queryFilter(filter, -5000); // Check last ~4 hours on BSC (~3s per block)
                    if (logs.length > 0) {
                        const latestLog = logs[logs.length - 1];
                        actualTxHash = latestLog.transactionHash;
                    }
                } catch (hashError) {
                    console.error('⚠️ [DEPOSITS] Could not fetch real txHash, using fallback:', hashError);
                }

                await prisma.deposit.update({
                    where: { id: deposit.id },
                    data: { status: 'CONFIRMED', txHash: actualTxHash },
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
                confirmedCount++;
            }
        } catch (err) {
            console.error(`❌ [DEPOSITS] Error processing ${deposit.id}:`, err);
        }
    }
    return { message: `Processed deposits`, confirmed: confirmedCount };
}

export async function processWithdrawals() {
    console.log('🔄 [WITHDRAWALS] Checking for pending withdrawals...');
    const usdtContract = getContract();
    
    const pendingWithdrawals = await prisma.withdraw.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
    });

    if (pendingWithdrawals.length === 0) {
        return { message: 'No pending withdrawals found' };
    }

    let processedCount = 0;
    const decimals = await usdtContract.decimals();
    
    for (const withdrawal of pendingWithdrawals) {
        try {
            const amountWei = parseUnits(withdrawal.amount.toString(), decimals);
            const tx = await usdtContract.transfer(withdrawal.walletAddress, amountWei);
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
                processedCount++;
            } else {
                throw new Error('Transaction reverted');
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
        }
    }
    return { message: `Processed withdrawals`, handled: processedCount };
}

export async function processPoolMaturity() {
    console.log('🔄 [POOLS] Checking for matured pools...');
    
    const now = new Date();
    const activePools = await prisma.pool.findMany({
        where: {
            status: 'ACTIVE',
            endDate: { lte: now }
        },
        include: { user: true }
    });

    if (activePools.length === 0) {
        return { message: 'No matured pools found' };
    }

    let maturedCount = 0;

    for (const pool of activePools) {
        try {
            const principal = parseFloat(pool.amount.toString());
            const annualRate = parseFloat(pool.interestRate.toString());
            const startDate = new Date(pool.startDate);
            const endDate = new Date(pool.endDate);
            
            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            const timeInYears = months / 12;
            const interestEarned = principal * (annualRate / 100) * timeInYears;
            const totalPayout = principal + interestEarned;

            await prisma.pool.update({
                where: { id: pool.id },
                data: { status: 'COMPLETED' },
            });

            await prisma.wallet.update({
                where: { userId: pool.userId },
                data: { balance: { increment: totalPayout } },
            });

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
            maturedCount++;
        } catch (err: any) {
            console.error(`❌ [POOLS] Error processing pool ${pool.id}:`, err.message || err);
        }
    }
    return { message: `Processed pool maturity`, matured: maturedCount };
}
