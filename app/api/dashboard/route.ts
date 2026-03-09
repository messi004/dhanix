export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const [
            wallet,
            activePools,
            totalTransactions,
            referralEarnings,
            recentTransactions,
        ] = await Promise.all([
            prisma.wallet.findUnique({ where: { userId: user.id } }),
            prisma.pool.findMany({ where: { userId: user.id, status: 'ACTIVE' } }),
            prisma.transaction.aggregate({
                where: {
                    userId: user.id,
                    type: { in: ['INTEREST', 'REFERRAL_REWARD', 'WELCOME_BONUS'] }
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: { userId: user.id, type: 'REFERRAL_REWARD' },
                _sum: { amount: true },
            }),
            prisma.transaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ])

        return NextResponse.json({
            balance: wallet?.balance?.toString() || '0',
            activePools: activePools.length,
            activePoolsTotal: activePools.reduce(
                (sum: number, p: { amount: { toString(): string } }) => sum + parseFloat(p.amount.toString()),
                0
            ).toFixed(2),
            totalEarnings: totalTransactions._sum?.amount?.toString() || '0',
            referralEarnings: referralEarnings._sum?.amount?.toString() || '0',
            recentTransactions,
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
