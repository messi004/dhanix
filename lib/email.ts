import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
})

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: `"Dhanix" <${process.env.SMTP_USER || 'noreply@dhanix.com'}>`,
            to: email,
            subject: 'Dhanix - Email Verification OTP',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #f1f1f4; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #a78bfa); line-height: 50px; font-size: 24px; font-weight: 900; color: white;">D</div>
                        <h1 style="margin: 12px 0 0; font-size: 22px; color: #f1f1f4;">Dhanix</h1>
                    </div>
                    <h2 style="text-align: center; font-size: 18px; color: #a1a1b5; margin-bottom: 30px;">Email Verification</h2>
                    <div style="text-align: center; background: #16161f; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 30px; margin-bottom: 24px;">
                        <p style="color: #a1a1b5; font-size: 14px; margin: 0 0 12px;">Your verification code is:</p>
                        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #a78bfa;">${otp}</div>
                    </div>
                    <p style="text-align: center; color: #6b6b80; font-size: 13px; margin: 0;">This code expires in <strong style="color: #f59e0b;">10 minutes</strong>. Do not share it with anyone.</p>
                </div>
            `,
        })
        return true
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}
