import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'
import { depositSchema } from '@/lib/validations'
import { generateDepositAddress } from '@/lib/blockchain'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const deposits = await prisma.deposit.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ deposits })
    } catch (error) {
        console.error('Deposits error:', error)
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
        const parsed = depositSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { amount } = parsed.data
        const minDeposit = parseFloat(await getSetting('min_deposit'))
        const maxDeposit = parseFloat(await getSetting('max_deposit'))

        if (amount < minDeposit) {
            return NextResponse.json(
                { error: `Minimum deposit is ${minDeposit} USDT` },
                { status: 400 }
            )
        }

        if (amount > maxDeposit) {
            return NextResponse.json(
                { error: `Maximum deposit is ${maxDeposit} USDT` },
                { status: 400 }
            )
        }

        // Generate deposit address
        const depositCount = await prisma.deposit.count({ where: { userId: user.id } })
        const { address } = generateDepositAddress(depositCount)

        const deposit = await prisma.deposit.create({
            data: {
                userId: user.id,
                amount,
                address,
                status: 'PENDING',
            },
        })

        return NextResponse.json({
            message: 'Deposit created. Send USDT BEP20 to the address below.',
            deposit,
        })
    } catch (error) {
        console.error('Deposit error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
