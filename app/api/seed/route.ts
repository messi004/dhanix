export const runtime = "edge";

export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        })

        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists' })
        }

        const hashedPassword = await hashPassword('admin123')

        const admin = await prisma.user.create({
            data: {
                email: 'admin@dhanix.com',
                password: hashedPassword,
                referralCode: 'ADMIN001',
                role: 'ADMIN',
                wallet: {
                    create: { balance: 0 },
                },
            },
        })

        return NextResponse.json({
            message: 'Admin created',
            email: admin.email,
            password: 'admin123',
        })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
