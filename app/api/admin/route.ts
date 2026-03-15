export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSettings, updateSetting } from '@/lib/settings'
import { sendTransactionNotification } from '@/lib/email'

// Middleware to check admin
async function requireAdmin() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        return null
    }
    return user
}

export async function GET(request: Request) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')

    try {
        switch (resource) {
            case 'stats': {
                const [users, deposits, withdrawals, pools, tickets] = await Promise.all([
                    prisma.user.count(),
                    prisma.deposit.aggregate({ where: { status: 'CONFIRMED' }, _sum: { amount: true }, _count: true }),
                    prisma.withdraw.aggregate({ where: { status: 'SENT' }, _sum: { amount: true }, _count: true }),
                    prisma.pool.aggregate({ where: { status: 'ACTIVE' }, _sum: { amount: true }, _count: true }),
                    prisma.ticket.count({ where: { status: { in: ['OPEN', 'PENDING'] } } }),
                ])
                return NextResponse.json({
                    totalUsers: users,
                    totalDeposits: deposits._count,
                    depositVolume: deposits._sum?.amount?.toString() || '0',
                    totalWithdrawals: withdrawals._count,
                    withdrawVolume: withdrawals._sum?.amount?.toString() || '0',
                    totalPools: pools._count,
                    poolVolume: pools._sum?.amount?.toString() || '0',
                    openTickets: tickets,
                })
            }
            case 'users': {
                const page = parseInt(searchParams.get('page') || '1')
                const users = await prisma.user.findMany({
                    include: { wallet: true, _count: { select: { pools: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * 20,
                    take: 20,
                })
                const total = await prisma.user.count()
                return NextResponse.json({ users, total })
            }
            case 'deposits': {
                const deposits = await prisma.deposit.findMany({
                    include: { user: { select: { email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                })
                return NextResponse.json({ deposits })
            }
            case 'withdrawals': {
                const withdrawals = await prisma.withdraw.findMany({
                    include: { user: { select: { email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                })
                return NextResponse.json({ withdrawals })
            }
            case 'pools': {
                const pools = await prisma.pool.findMany({
                    include: { user: { select: { email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                })
                return NextResponse.json({ pools })
            }
            case 'transactions': {
                const transactions = await prisma.transaction.findMany({
                    include: { user: { select: { email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                })
                return NextResponse.json({ transactions })
            }
            case 'tickets': {
                const tickets = await prisma.ticket.findMany({
                    include: {
                        user: { select: { email: true } },
                        _count: { select: { messages: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                })
                return NextResponse.json({ tickets })
            }
            case 'settings': {
                const settings = await getSettings()
                return NextResponse.json({ settings })
            }
            default:
                return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
        }
    } catch (error) {
        console.error('Admin GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    try {
        switch (action) {
            case 'confirm-deposit': {
                const deposit = await prisma.deposit.update({
                    where: { id: body.depositId },
                    data: { status: 'CONFIRMED', txHash: body.txHash || 'manual-confirm' },
                    include: { user: true },
                })
                // Credit user wallet
                await prisma.wallet.update({
                    where: { userId: deposit.userId },
                    data: { balance: { increment: deposit.amount } },
                })
                await prisma.transaction.create({
                    data: {
                        userId: deposit.userId,
                        type: 'DEPOSIT',
                        amount: deposit.amount,
                        referenceId: deposit.id,
                        description: `Deposit of ${deposit.amount} USDT confirmed`,
                    },
                })
                await sendTransactionNotification(
                    deposit.user.email,
                    'DEPOSIT',
                    deposit.amount.toString(),
                    `Your deposit of ${deposit.amount} USDT has been manually confirmed and credited to your wallet.`
                )
                return NextResponse.json({ message: 'Deposit confirmed' })
            }
            case 'reject-deposit': {
                const deposit = await prisma.deposit.update({
                    where: { id: body.depositId },
                    data: { status: 'FAILED' },
                    include: { user: true },
                })
                await sendTransactionNotification(
                    deposit.user.email,
                    'REJECTED',
                    deposit.amount.toString(),
                    `Your deposit request of ${deposit.amount} USDT was rejected by the admin. Please verify your transaction details and try again.`
                )
                return NextResponse.json({ message: 'Deposit rejected' })
            }
            case 'approve-withdrawal': {
                const withdrawal = await prisma.withdraw.update({
                    where: { id: body.withdrawalId },
                    data: { status: 'SENT', txHash: body.txHash || 'manual-approve' },
                    include: { user: true },
                })
                await sendTransactionNotification(
                    withdrawal.user.email,
                    'WITHDRAWAL',
                    withdrawal.amount.toString(),
                    `Your withdrawal of ${withdrawal.amount} USDT to address ${withdrawal.walletAddress} has been approved and sent.`
                )
                return NextResponse.json({ message: 'Withdrawal approved' })
            }
            case 'reject-withdrawal': {
                const withdrawal = await prisma.withdraw.findUnique({
                    where: { id: body.withdrawalId },
                    include: { user: true },
                })
                if (withdrawal) {
                    await prisma.withdraw.update({
                        where: { id: body.withdrawalId },
                        data: { status: 'FAILED' },
                    })
                    // Refund wallet
                    await prisma.wallet.update({
                        where: { userId: withdrawal.userId },
                        data: { balance: { increment: withdrawal.amount } },
                    })
                    // Log the refund transaction
                    await prisma.transaction.create({
                        data: {
                            userId: withdrawal.userId,
                            type: 'DEPOSIT', // Using DEPOSIT as a positive ledger entry for the refund
                            amount: withdrawal.amount,
                            referenceId: withdrawal.id,
                            description: `Refund for rejected withdrawal to ${withdrawal.walletAddress}`,
                        }
                    })
                    await sendTransactionNotification(
                        withdrawal.user.email,
                        'REJECTED',
                        withdrawal.amount.toString(),
                        `Your withdrawal request of ${withdrawal.amount} USDT to ${withdrawal.walletAddress} was rejected and the amount has been refunded to your Dhanix wallet.`
                    )
                }
                return NextResponse.json({ message: 'Withdrawal rejected and refunded' })
            }
            case 'close-ticket': {
                await prisma.ticket.update({
                    where: { id: body.ticketId },
                    data: { status: 'CLOSED' },
                })
                return NextResponse.json({ message: 'Ticket closed' })
            }
            case 'update-settings': {
                const { settings } = body
                for (const [key, value] of Object.entries(settings)) {
                    await updateSetting(key, value as string)
                }
                return NextResponse.json({ message: 'Settings updated' })
            }
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        console.error('Admin POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
