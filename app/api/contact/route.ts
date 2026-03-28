import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json()

        if (!email || !message) {
            return NextResponse.json({ error: 'Email and message are required' }, { status: 400 })
        }

        const contactMessage = await prisma.contactMessage.create({
            data: { name, email, message }
        })

        return NextResponse.json({ success: true, message: 'Message sent successfully', id: contactMessage.id })
    } catch (err) {
        console.error('Contact form error:', err)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ messages })
    } catch (err) {
        console.error('Fetch contact messages error:', err)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
        }

        await prisma.contactMessage.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: 'Message deleted' })
    } catch (err: any) {
        if (err?.code === 'P2025') {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }
        console.error('Delete contact message error:', err)
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }
}
