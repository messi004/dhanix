export const runtime = "edge";

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

        const referrals = await prisma.referral.findMany({
            where: { referrerId: user.id },
            include: {
                referredUser: {
                    select: { email: true, createdAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const totalRewards = referrals.reduce(
            (sum: number, r: { rewardAmount: { toString(): string } }) => sum + parseFloat(r.rewardAmount.toString()),
            0
        )

        const referredUsers = await prisma.user.count({
            where: { referredBy: user.id },
        })

        return NextResponse.json({
            referralCode: user.referralCode,
            referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.referralCode}`,
            totalRewards: totalRewards.toFixed(2),
            referredUsers,
            referrals,
        })
    } catch (error) {
        console.error('Referral error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
