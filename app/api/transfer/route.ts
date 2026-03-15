export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { transferSchema } from '@/lib/validations'
import { sendTransferSentEmail, sendTransferReceivedEmail } from '@/lib/email'
import { TransactionType } from '@prisma/client'

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = transferSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { recipientEmail, amount } = parsed.data

        if (user.email.toLowerCase() === recipientEmail.toLowerCase()) {
            return NextResponse.json({ error: 'You cannot transfer to yourself' }, { status: 400 })
        }

        // Find recipient
        const recipient = await prisma.user.findUnique({
            where: { email: recipientEmail },
            include: { wallet: true }
        })

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 })
        }

        if (!recipient.wallet) {
            // Edge case: recipient doesn't have a wallet yet. Create one.
            recipient.wallet = await prisma.wallet.create({
                data: { userId: recipient.id, balance: 0 }
            })
        }

        // Check sender balance
        const senderWallet = await prisma.wallet.findUnique({
            where: { userId: user.id }
        })

        if (!senderWallet || parseFloat(senderWallet.balance.toString()) < amount) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
        }

        // Perform the transfer atomically
        await prisma.$transaction(async (tx) => {
            // Deduct from sender
            await tx.wallet.update({
                where: { userId: user.id },
                data: { balance: { decrement: amount } }
            })

            // Add to recipient
            await tx.wallet.update({
                where: { userId: recipient.id },
                data: { balance: { increment: amount } }
            })

            // Record sender transaction (negative)
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: TransactionType.TRANSFER,
                    amount: -amount,
                    description: `Transferred ${amount} USDT to ${recipient.email}`
                }
            })

            // Record recipient transaction (positive)
            await tx.transaction.create({
                data: {
                    userId: recipient.id,
                    type: TransactionType.TRANSFER,
                    amount: amount,
                    description: `Received ${amount} USDT from ${user.email}`
                }
            })
        })

        // Send notifications (do not await so API responds fast)
        sendTransferSentEmail(user.email, recipient.email, amount).catch(console.error)
        sendTransferReceivedEmail(recipient.email, user.email, amount).catch(console.error)

        return NextResponse.json({ message: 'Transfer successful' })

    } catch (error) {
        console.error('Transfer error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
