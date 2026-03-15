export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'
import { withdrawSchema } from '@/lib/validations'
import { sendUSDT } from '@/lib/blockchain'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const withdrawals = await prisma.withdraw.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ withdrawals })
    } catch (error) {
        console.error('Withdrawals error:', error)
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
        const parsed = withdrawSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { amount, walletAddress } = parsed.data
        const minWithdraw = parseFloat(await getSetting('min_withdraw'))
        const maxWithdraw = parseFloat(await getSetting('max_withdraw'))
        const withdrawPerDay = parseInt(await getSetting('withdraw_per_day'))

        if (amount < minWithdraw) {
            return NextResponse.json(
                { error: `Minimum withdrawal is ${minWithdraw} USDT` },
                { status: 400 }
            )
        }

        if (amount > maxWithdraw) {
            return NextResponse.json(
                { error: `Maximum withdrawal is ${maxWithdraw} USDT` },
                { status: 400 }
            )
        }

        // Check daily withdrawal limit
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayWithdrawals = await prisma.withdraw.count({
            where: {
                userId: user.id,
                createdAt: { gte: today },
                status: { not: 'FAILED' },
            },
        })

        if (todayWithdrawals >= withdrawPerDay) {
            return NextResponse.json(
                { error: `Maximum ${withdrawPerDay} withdrawal(s) per day` },
                { status: 400 }
            )
        }

        // Check wallet balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        })

        if (!wallet || parseFloat(wallet.balance.toString()) < amount) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            )
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdraw.create({
            data: {
                userId: user.id,
                amount,
                walletAddress,
                status: 'PENDING',
            },
        })

        // Deduct balance
        await prisma.wallet.update({
            where: { userId: user.id },
            data: { balance: { decrement: amount } },
        })

        // Record transaction
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'WITHDRAW',
                amount: -amount,
                referenceId: withdrawal.id,
                description: `Withdrawal of ${amount} USDT to ${walletAddress}`,
            },
        })

        // Try auto-send (only if MAIN_WALLET_PRIVATE_KEY is configured)
        if (process.env.MAIN_WALLET_PRIVATE_KEY) {
            const result = await sendUSDT(walletAddress, amount.toString())
            if ('txHash' in result) {
                await prisma.withdraw.update({
                    where: { id: withdrawal.id },
                    data: { txHash: result.txHash, status: 'SENT' },
                })
            }
        }

        return NextResponse.json({
            message: 'Withdrawal request created',
            withdrawal,
        })
    } catch (error) {
        console.error('Withdraw error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
