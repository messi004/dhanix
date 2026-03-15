export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ticketSchema } from '@/lib/validations'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const tickets = await prisma.ticket.findMany({
            where: { userId: user.id },
            include: { _count: { select: { messages: true } } },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ tickets })
    } catch (error) {
        console.error('Tickets error:', error)
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
        const parsed = ticketSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { subject, message } = parsed.data

        const ticket = await prisma.ticket.create({
            data: {
                userId: user.id,
                subject,
                messages: {
                    create: {
                        sender: 'USER',
                        message,
                    },
                },
            },
            include: { messages: true, _count: { select: { messages: true } } },
        })

        return NextResponse.json({ message: 'Ticket created', ticket })
    } catch (error) {
        console.error('Ticket error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
