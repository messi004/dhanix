import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    referralCode: z.string().optional(),
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    otp: z.string().optional(),
})

export const depositSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
})

export const withdrawSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid BSC wallet address'),
})

export const poolSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
})

export const ticketSchema = z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const ticketMessageSchema = z.object({
    message: z.string().min(1, 'Message is required'),
})

export const settingsSchema = z.record(z.string(), z.string())
