export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signToken, generateReferralCode } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password, referralCode } = parsed.data

        // Check OTP verification
        const verifiedOtp = await prisma.otp.findFirst({
            where: {
                email,
                verified: true,
                expiresAt: { gt: new Date(Date.now() - 30 * 60 * 1000) }, // verified within last 30 min
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!verifiedOtp) {
            return NextResponse.json(
                { error: 'Email not verified. Please verify your email with OTP first.' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            )
        }

        // Validate referral code if provided
        let referrerId: string | null = null
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode },
            })
            if (!referrer) {
                return NextResponse.json(
                    { error: 'Invalid referral code' },
                    { status: 400 }
                )
            }
            referrerId = referrer.id
        }

        // Generate unique referral code
        let newReferralCode = generateReferralCode()
        while (await prisma.user.findUnique({ where: { referralCode: newReferralCode } })) {
            newReferralCode = generateReferralCode()
        }

        const hashedPassword = await hashPassword(password)

        // Create user with wallet
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                referralCode: newReferralCode,
                referredBy: referrerId,
                wallet: {
                    create: {
                        balance: 0,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                referralCode: true,
            },
        })

        // Cleanup OTPs for this email
        await prisma.otp.deleteMany({ where: { email } })

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        const response = NextResponse.json({
            message: 'Registration successful',
            user,
        })

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
