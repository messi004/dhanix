export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password || password.length < 8) {
            return NextResponse.json({ error: 'Invalid inputs. Password must be at least 8 characters' }, { status: 400 })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify that OTP was verified recently
        const verifiedOtp = await prisma.otp.findFirst({
            where: {
                email,
                verified: true,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!verifiedOtp) {
            return NextResponse.json({ error: 'Please verify OTP first' }, { status: 401 })
        }

        // Hash new password and update user
        const hashedPassword = await hash(password, 12)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        })

        // Delete all OTPs for this email to prevent reuse
        await prisma.otp.deleteMany({
            where: { email },
        })

        return NextResponse.json({ message: 'Password reset successfully' })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
