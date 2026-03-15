export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { generateOtp, sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = loginSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password, otp } = parsed.data

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                referralCode: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // If OTP is provided, verify it
        if (otp) {
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
                return NextResponse.json(
                    { error: 'Invalid or expired OTP' },
                    { status: 400 }
                )
            }

            // Cleanup OTPs after successful login
            await prisma.otp.deleteMany({ where: { email } })

            const token = await signToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            })

            const response = NextResponse.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    referralCode: user.referralCode,
                },
            })

            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            })

            return response
        }

        // Generate and send OTP (rate limit: 5 per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentOtps = await prisma.otp.count({
            where: { email, createdAt: { gte: oneHourAgo } },
        })
        if (recentOtps >= 5) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Try again later.' },
                { status: 429 }
            )
        }

        const code = generateOtp()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.otp.create({
            data: { email, code, expiresAt },
        })

        const sent = await sendOtpEmail(email, code)
        if (!sent) {
            return NextResponse.json(
                { error: 'Failed to send OTP email. Check SMTP settings.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ requireOtp: true, message: 'OTP sent to your email' })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
