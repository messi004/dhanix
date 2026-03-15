export const runtime = "edge";
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendUSDT } from '@/lib/blockchain'
import { sendTransactionNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('🔄 [WITHDRAWALS] Checking for pending withdrawals...')
        
        const pendingWithdrawals = await prisma.withdraw.findMany({
            where: { status: 'PENDING' },
            include: { user: true },
        })

        if (pendingWithdrawals.length === 0) {
             return NextResponse.json({ message: 'No pending withdrawals found' })
        }

        const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY
        if (!privateKey) throw new Error('MAIN_WALLET_PRIVATE_KEY missing')

        let processedCount = 0

        for (const withdrawal of pendingWithdrawals) {
            try {
                const result = await sendUSDT(withdrawal.walletAddress, withdrawal.amount.toString())
                
                if ('txHash' in result) {
                    await prisma.withdraw.update({
                        where: { id: withdrawal.id },
                        data: { status: 'SENT', txHash: result.txHash }
                    })
                    await sendTransactionNotification(
                        withdrawal.user.email,
                        'WITHDRAWAL',
                        withdrawal.amount.toString(),
                        `Your withdrawal of ${withdrawal.amount} USDT to address ${withdrawal.walletAddress} has been successfully sent to the blockchain.`
                    )
                    processedCount++
                } else {
                     throw new Error(result.error)
                }
            } catch (err: unknown) {
                console.error(`❌ [WITHDRAWALS] Error processing ${withdrawal.id}:`, err instanceof Error ? err.message : err)
                await prisma.withdraw.update({ where: { id: withdrawal.id }, data: { status: 'FAILED' } })
                await prisma.wallet.update({ where: { userId: withdrawal.userId }, data: { balance: { increment: withdrawal.amount } } })
                await sendTransactionNotification(
                    withdrawal.user.email,
                    'REJECTED',
                    withdrawal.amount.toString(),
                    `Your withdrawal of ${withdrawal.amount} USDT failed and has been refunded to your wallet.`
                )
            }
        }

        return NextResponse.json({ message: `Processed ${processedCount}/${pendingWithdrawals.length} withdrawals` })
    } catch (error) {
        console.error('❌ [WITHDRAWALS] Cron Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
