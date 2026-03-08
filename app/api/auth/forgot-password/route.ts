import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateOtp, sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        // Check if email is already registered (Must be, for forgot password)
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Rate limit: max 3 OTPs per email per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentOtps = await prisma.otp.count({
            where: { email, createdAt: { gte: oneHourAgo } },
        })
        if (recentOtps >= 5) {
            return NextResponse.json({ error: 'Too many OTP requests. Try again later.' }, { status: 429 })
        }

        // Generate OTP
        const code = generateOtp()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Save OTP
        await prisma.otp.create({
            data: { email, code, expiresAt },
        })

        // Send email
        const sent = await sendOtpEmail(email, code)
        if (!sent) {
            return NextResponse.json({ error: 'Failed to send OTP email. Check SMTP settings.' }, { status: 500 })
        }

        return NextResponse.json({ message: 'OTP sent to your email' })
    } catch (error) {
        console.error('Forgot Password Send OTP error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
