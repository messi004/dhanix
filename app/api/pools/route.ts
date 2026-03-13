export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'
import { sendTransactionNotification } from '@/lib/email'
import { poolSchema } from '@/lib/validations'
import { getMaturityDate, calculateSimpleInterest } from '@/lib/interest'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const pools = await prisma.pool.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        })

        const interestRate = await getSetting('interest_rate')
        const minPoolDurationMonths = await getSetting('min_pool_duration_months')

        return NextResponse.json({ pools, interestRate, minPoolDurationMonths })
    } catch (error) {
        console.error('Pools error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = poolSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        // Validate duration is provided
        const { amount, durationMonths } = body;
        if (!amount || !durationMonths) {
            return NextResponse.json(
                { error: 'Invalid input. Please provide amount and durationMonths' },
                { status: 400 }
            )
        }

        const minStake = parseFloat(await getSetting('min_stake'))
        const maxStake = parseFloat(await getSetting('max_stake'))
        const interestRate = parseFloat(await getSetting('interest_rate'))
        const minDurationMonths = parseInt(await getSetting('min_pool_duration_months'))
        const referralPercentage = parseFloat(await getSetting('referral_percentage'))
        const welcomeBonusPercentage = parseFloat(await getSetting('welcome_bonus_percentage'))

        if (amount < minStake) {
            return NextResponse.json(
                { error: `Minimum stake is ${minStake} USDT` },
                { status: 400 }
            )
        }

        if (amount > maxStake) {
            return NextResponse.json(
                { error: `Maximum stake is ${maxStake} USDT` },
                { status: 400 }
            )
        }

        if (durationMonths < minDurationMonths) {
            return NextResponse.json(
                { error: `Minimum pool duration is ${minDurationMonths} month(s)` },
                { status: 400 }
            )
        }

        // Check wallet balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        })

        if (!wallet || parseFloat(wallet.balance.toString()) < amount) {
            return NextResponse.json(
                { error: 'Insufficient wallet balance' },
                { status: 400 }
            )
        }

        const startDate = new Date()
        const endDate = getMaturityDate(startDate, durationMonths)

        // Check if this is user's first pool (for welcome bonus and referral)
        const existingPools = await prisma.pool.count({
            where: { userId: user.id },
        })
        const isFirstPool = existingPools === 0

        // Create pool
        const pool = await prisma.pool.create({
            data: {
                userId: user.id,
                amount,
                interestRate,
                startDate,
                endDate,
                status: 'ACTIVE',
            },
        })

        // Deduct from wallet
        await prisma.wallet.update({
            where: { userId: user.id },
            data: { balance: { decrement: amount } },
        })

        // Record staking transaction
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'STAKED',
                amount: -amount,
                referenceId: pool.id,
                description: `Staked ${amount} USDT for ${durationMonths} month(s)`,
            },
        })

        await sendTransactionNotification(
            user.email,
            'STAKED',
            amount.toString(),
            `You have successfully staked ${amount} USDT for a duration of ${durationMonths} month(s).`
        )

        // Apply welcome bonus on first pool
        if (isFirstPool) {
            const bonusAmount = amount * (welcomeBonusPercentage / 100)
            await prisma.wallet.update({
                where: { userId: user.id },
                data: { balance: { increment: bonusAmount } },
            })
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: 'WELCOME_BONUS',
                    amount: bonusAmount,
                    referenceId: pool.id,
                    description: `Welcome bonus ${welcomeBonusPercentage}% on first stake`,
                },
            })
            await sendTransactionNotification(
                user.email,
                'WELCOME',
                bonusAmount.toString(),
                `Congratulations! You received a ${welcomeBonusPercentage}% welcome bonus on your first stake.`
            )
        }

        // Apply referral reward on first three pools
        if (existingPools < 3 && user.referredBy) {
            let currentReferrerId: string | null = user.referredBy;
            let currentRewardAmount = amount * (referralPercentage / 100);
            let currentLevel = 1;

            while (currentReferrerId && currentLevel <= 3) {
                // Fetch referrer account
                const refAccount: { id: string, email: string, referredBy: string | null } | null = await prisma.user.findUnique({
                    where: { id: currentReferrerId },
                    select: { id: true, email: true, referredBy: true }
                });

                if (refAccount) {
                    // Credit referrer
                    await prisma.wallet.update({
                        where: { userId: refAccount.id },
                        data: { balance: { increment: currentRewardAmount } },
                    });

                    // Record referral
                    await prisma.referral.create({
                        data: {
                            referrerId: refAccount.id,
                            referredUserId: user.id,
                            rewardAmount: currentRewardAmount,
                        },
                    });

                    // Record transaction for referrer
                    await prisma.transaction.create({
                        data: {
                            userId: refAccount.id,
                            type: 'REFERRAL_REWARD',
                            amount: currentRewardAmount,
                            referenceId: pool.id,
                            description: `Level ${currentLevel} referral reward from ${user.email}'s pool #${existingPools + 1}`,
                        },
                    });

                    await sendTransactionNotification(
                        refAccount.email,
                        'REFERRAL',
                        currentRewardAmount.toString(),
                        `Great news! You received a Level ${currentLevel} referral reward from your friend's pool creation.`
                    );

                    // Prepare for next level
                    currentReferrerId = refAccount.referredBy;
                    currentRewardAmount = currentRewardAmount / 2;
                    currentLevel++;
                } else {
                    break;
                }
            }
        }

        const expectedInterest = calculateSimpleInterest(amount, interestRate, durationMonths)

        return NextResponse.json({
            message: 'Pool created successfully',
            pool,
            expectedInterest: expectedInterest.toFixed(2),
            totalReturn: (amount + expectedInterest).toFixed(2),
        })
    } catch (error) {
        console.error('Pool error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
