export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function requireAdmin() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        return null
    }
    return user
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await requireAdmin()
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const { id } = await context.params
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                user: { select: { email: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        })

        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

        return NextResponse.json({ ticket })
    } catch (error) {
        console.error('Admin ticket GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await requireAdmin()
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const { id } = await context.params
        const body = await request.json()

        if (!body.message || body.message.length < 2) {
            return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
        }

        const ticket = await prisma.ticket.findUnique({ where: { id } })
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

        // Create message and optionally update ticket status
        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                sender: 'ADMIN',
                message: body.message,
            },
        })

        // Ensure ticket is open when an admin replies
        if (ticket.status === 'CLOSED') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'OPEN' }
            })
        }

        return NextResponse.json({ message: 'Reply sent', data: message })
    } catch (error) {
        console.error('Admin ticket POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
