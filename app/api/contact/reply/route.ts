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

        let body: any
        try {
            body = await req.json()
        } catch (e) {
            if (e instanceof SyntaxError) {
                return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
            }
            throw e
        }

        const { messageId, replyText } = body

        if (!messageId || !replyText) {
            return NextResponse.json({ error: 'Message ID and reply text are required' }, { status: 400 })
        }

        const message = await prisma.contactMessage.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }

        if (message.replied) {
            return NextResponse.json({ error: 'This message has already been replied to.' }, { status: 400 })
        }


        // Step 1: Store reply text in DB first (mark as pending)
        await prisma.contactMessage.update({
            where: { id: messageId },
            data: {
                replyText: replyText
            }
        })

        // Step 2: Send the email
        const emailSent = await sendContactReplyEmail(
            message.email,
            message.name,
            message.message,
            replyText
        )

        if (!emailSent) {
            console.error(`Failed to send reply email for messageId=${messageId}. Reply text was saved but email not delivered.`)
            return NextResponse.json({ error: 'Failed to send email. Reply saved but not delivered.' }, { status: 500 })
        }

        // Step 3: Mark as fully replied after successful email
        const updateResult = await prisma.contactMessage.updateMany({
            where: { id: messageId, replied: false },
            data: { replied: true }
        })

        if (updateResult.count === 0) {
            // Email was sent but flag didn't flip (likely concurrent request flipped it first)
            console.warn(`WARNING: Reply email delivered for messageId=${messageId}, but the replied flag was not flipped (prevented duplicate or already true).`)
        }

        return NextResponse.json({ success: true, message: 'Reply sent successfully' })
    } catch (err) {
        console.error('Contact reply error:', err)
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
    }
}
