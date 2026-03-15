import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendTransactionNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('🔄 [POOLS] Checking for matured pools...')
        
        const now = new Date()
        const activePools = await prisma.pool.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { lte: now }
            },
            include: { user: true }
        })

        if (activePools.length === 0) {
            return NextResponse.json({ message: 'No matured pools found' })
        }

        let processedCount = 0

        for (const pool of activePools) {
            try {
                const principal = parseFloat(pool.amount.toString())
                const annualRate = parseFloat(pool.interestRate.toString())
                const startDate = new Date(pool.startDate)
                const endDate = new Date(pool.endDate)
                
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
                const timeInYears = months / 12
                const interestEarned = principal * (annualRate / 100) * timeInYears
                const totalPayout = principal + interestEarned

                await prisma.pool.update({
                    where: { id: pool.id },
                    data: { status: 'COMPLETED' },
                })

                await prisma.wallet.update({
                    where: { userId: pool.userId },
                    data: { balance: { increment: totalPayout } },
                })

                await prisma.transaction.create({
                    data: {
                        userId: pool.userId,
                        type: 'INTEREST',
                        amount: totalPayout,
                        referenceId: pool.id,
                        description: `Pool matured. Principal: ${principal} USDT, Interest: ${interestEarned.toFixed(2)} USDT`,
                    },
                })

                await sendTransactionNotification(
                    pool.user.email,
                    'INTEREST',
                    totalPayout.toFixed(2),
                    `Your staking pool of ${principal} USDT has matured! Total payout: ${totalPayout.toFixed(2)} USDT.`
                )
                processedCount++
            } catch (err: unknown) {
                console.error(`❌ [POOLS] Error processing pool ${pool.id}:`, err instanceof Error ? err.message : err)
            }
        }

        return NextResponse.json({ message: `Processed ${processedCount}/${activePools.length} matured pools` })
    } catch (error) {
        console.error('❌ [POOLS] Cron Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
