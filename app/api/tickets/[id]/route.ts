export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ticketMessageSchema } from '@/lib/validations'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { id } = await params

        const ticket = await prisma.ticket.findFirst({
            where: {
                id,
                ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
            },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                user: { select: { email: true } },
            },
        })

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        return NextResponse.json({ ticket })
    } catch (error) {
        console.error('Ticket detail error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const parsed = ticketMessageSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        // Check ticket exists and belongs to user (or user is admin)
        const ticket = await prisma.ticket.findFirst({
            where: {
                id,
                ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
            },
        })

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                sender: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
                message: parsed.data.message,
            },
        })

        // Update ticket status
        await prisma.ticket.update({
            where: { id },
            data: { status: user.role === 'ADMIN' ? 'PENDING' : 'OPEN' },
        })

        return NextResponse.json({ message })
    } catch (error) {
        console.error('Ticket message error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
