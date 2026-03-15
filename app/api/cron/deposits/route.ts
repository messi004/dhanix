export const runtime = "edge";
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { publicClient } from '@/lib/blockchain'
import { formatUnits, parseAbi } from 'viem'
import { sendTransactionNotification } from '@/lib/email'

const USDT_ABI = parseAbi([
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
])

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('🔄 [DEPOSITS] Checking for pending deposits...')
        
        const pendingDeposits = await prisma.deposit.findMany({
            where: { status: 'PENDING' },
            include: { user: true },
        })

        if (pendingDeposits.length === 0) {
             return NextResponse.json({ message: 'No pending deposits found' })
        }

        const usdtAddress = process.env.USDT_CONTRACT_ADDRESS as `0x${string}`
        const decimals = await publicClient.readContract({
            address: usdtAddress,
            abi: USDT_ABI,
            functionName: 'decimals',
        })
        let confirmedCount = 0

        for (const deposit of pendingDeposits) {
            try {
                const rawBalance = await publicClient.readContract({
                    address: usdtAddress,
                    abi: USDT_ABI,
                    functionName: 'balanceOf',
                    args: [deposit.address as `0x${string}`],
                })
                const balance = parseFloat(formatUnits(rawBalance as bigint, decimals))
                const expectedAmount = parseFloat(deposit.amount.toString())

                if (balance >= expectedAmount) {
                     await prisma.deposit.update({
                         where: { id: deposit.id },
                         data: { status: 'CONFIRMED', txHash: 'auto-confirmed-by-cron' },
                     })

                     await prisma.wallet.update({
                         where: { userId: deposit.userId },
                         data: { balance: { increment: deposit.amount } },
                     })

                     await prisma.transaction.create({
                         data: {
                             userId: deposit.userId, type: 'DEPOSIT', amount: deposit.amount,
                             referenceId: deposit.id, description: `Auto-confirmed Deposit of ${deposit.amount} USDT`,
                         },
                     })

                     await sendTransactionNotification(
                         deposit.user.email,
                         'DEPOSIT',
                         deposit.amount.toString(),
                         `Your deposit of ${deposit.amount} USDT has been automatically confirmed by the blockchain and credited to your wallet.`
                     )
                     confirmedCount++
                }
            } catch (err) {
                console.error(`❌ [DEPOSITS] Error processing deposit ${deposit.id}:`, err)
            }
        }

        return NextResponse.json({ message: `Processed ${pendingDeposits.length} deposits, ${confirmedCount} confirmed` })
    } catch (error) {
        console.error('❌ [DEPOSITS] Cron Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
