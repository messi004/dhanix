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

        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        })

        return NextResponse.json({
            balance: wallet?.balance?.toString() || '0',
        })
    } catch (error) {
        console.error('Wallet error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
