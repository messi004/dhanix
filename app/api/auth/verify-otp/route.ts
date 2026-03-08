import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
        }

        // Find valid OTP
        const otpRecord = await prisma.otp.findFirst({
            where: {
                email,
                code: otp,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
        }

        // Mark as verified
        await prisma.otp.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        })

        return NextResponse.json({ message: 'OTP verified', verified: true })
    } catch (error) {
        console.error('Verify OTP error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
