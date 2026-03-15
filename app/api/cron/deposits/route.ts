import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUSDTContract } from '@/lib/blockchain'
import { ethers } from 'ethers'
import { sendTransactionNotification } from '@/lib/email'

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

        const usdtContract = getUSDTContract()
        const decimals = await usdtContract.decimals()
        let confirmedCount = 0

        for (const deposit of pendingDeposits) {
            try {
                const rawBalance = await usdtContract.balanceOf(deposit.address)
                const balance = parseFloat(ethers.utils.formatUnits(rawBalance, decimals))
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
