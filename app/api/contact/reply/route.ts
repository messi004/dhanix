import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendContactReplyEmail } from '@/lib/email'

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { messageId, replyText } = await req.json()

        if (!messageId || !replyText) {
            return NextResponse.json({ error: 'Message ID and reply text are required' }, { status: 400 })
        }

        const message = await prisma.contactMessage.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }

        const emailSent = await sendContactReplyEmail(
            message.email,
            message.name,
            message.message,
            replyText
        )

        if (!emailSent) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        await prisma.contactMessage.update({
            where: { id: messageId },
            data: {
                replied: true,
                replyText: replyText
            }
        })

        return NextResponse.json({ success: true, message: 'Reply sent successfully' })
    } catch (err) {
        console.error('Contact reply error:', err)
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
    }
}
