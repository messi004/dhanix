// nodemailer is not compatible with Edge runtime. 
// Recommend switching to a service like Resend or SendGrid.
// import nodemailer from 'nodemailer'

const transporter = {
    sendMail: async (opts: { to: string, subject: string, html: string, from?: string }) => {
        console.log('Mock Email Sent:', opts.subject, 'to', opts.to);
        // In a real Edge environment, you would use:
        // await fetch('https://api.resend.com/emails', { ... })
        return { messageId: 'mock-id' };
    }
}

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const getBaseEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
  .wrapper { background-color: #f4f4f5; padding: 40px 20px; text-align: center; }
  .container { max-width: 500px; margin: 0 auto; background: #ffffff; color: #18181b; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: left; }
  .header { text-align: center; margin-bottom: 30px; }
  .logo { display: inline-block; width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #a78bfa); line-height: 50px; font-size: 24px; font-weight: 900; color: white; text-align: center; }
  .title { margin: 12px 0 0; font-size: 22px; color: #18181b; font-weight: 700; text-align: center; }
  .subtitle { text-align: center; font-size: 18px; color: #52525b; margin-bottom: 30px; font-weight: 500; }
  .content { font-size: 15px; color: #3f3f46; line-height: 1.6; }
  .box { text-align: center; background: #fdfaf0; border: 1px solid #fde68a; border-radius: 12px; padding: 30px; margin-bottom: 24px; }
  .box-text { color: #713f12; font-size: 14px; margin: 0 0 12px; }
  .box-value { font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #b45309; }
  .footer { text-align: center; color: #a1a1aa; font-size: 13px; margin-top: 30px; border-top: 1px solid #e4e4e7; padding-top: 20px; }
  .highlight { color: #7c3aed; font-weight: 600; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
        <div class="header">
            <div class="logo">D</div>
            <h1 class="title">Dhanix</h1>
        </div>
        <h2 class="subtitle">${title}</h2>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Dhanix. All rights reserved.<br>
            Please do not reply to this automated message.
        </div>
    </div>
  </div>
</body>
</html>
`

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const content = `
        <div class="box">
            <p class="box-text">Your verification code is:</p>
            <div class="box-value" style="letter-spacing: 8px;">${otp}</div>
        </div>
        <p style="text-align: center; margin: 0;">This code expires in <strong style="color: #ea580c;">10 minutes</strong>. Do not share it with anyone.</p>
    `;
    try {
        await transporter.sendMail({
            from: '"Dhanix" <' + (process.env.SMTP_USER || 'noreply@dhanix.com') + '>',
            to: email,
            subject: 'Dhanix - Email Verification',
            html: getBaseEmailTemplate('Email Verification', content),
        })
        return true
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}

export async function sendTransactionNotification(
    email: string, 
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'STAKED' | 'INTEREST' | 'REFERRAL' | 'WELCOME' | 'REJECTED', 
    amount: string, 
    description: string
): Promise<boolean> {
    const titleMap = {
        DEPOSIT: 'Deposit Confirmed',
        WITHDRAWAL: 'Withdrawal Processed',
        STAKED: 'Pool Created Successfully',
        INTEREST: 'Pool Matured - Interest Paid',
        REFERRAL: 'Referral Reward Received!',
        WELCOME: 'Welcome Bonus Credited!',
        REJECTED: 'Transaction Rejected & Refunded'
    };
    
    const colorMap = {
        DEPOSIT: '#16a34a',    // green
        WITHDRAWAL: '#dc2626', // red
        STAKED: '#2563eb',     // blue
        INTEREST: '#16a34a',   // green
        REFERRAL: '#16a34a',   // green
        WELCOME: '#9333ea',    // purple
        REJECTED: '#ea580c'    // orange
    };

    const title = titleMap[type] || 'Transaction Update';
    const color = colorMap[type] || '#7c3aed';

    const content = `
        <p>Hello,</p>
        <p>We are writing to inform you about a recent transaction on your Dhanix account.</p>
        
        <div class="box" style="background: #f8fafc; border-color: #cbd5e1;">
            <p class="box-text" style="color: #475569;">Transaction Amount</p>
            <div class="box-value" style="color: ${color};">${amount} USDT</div>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px;"><strong>Details:</strong> ${description}</p>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
    `;

    try {
        await transporter.sendMail({
            from: '"Dhanix" <' + (process.env.SMTP_USER || 'noreply@dhanix.com') + '>',
            to: email,
            subject: 'Dhanix - ' + title,
            html: getBaseEmailTemplate(title, content),
        })
        return true
    } catch (error) {
        console.error('Notification email send error:', error)
        return false
    }
}

export async function sendWelcomeEmail(email: string): Promise<boolean> {
    const title = 'Welcome to Dhanix!';
    const content = `
        <p>Hello,</p>
        <p>Welcome to <strong>Dhanix</strong>! We are thrilled to have you join our platform.</p>
        
        <div class="box" style="background: #fdfaf0; border-color: #fde68a;">
            <p class="box-text" style="color: #713f12; font-size: 16px;"><strong>Ready to grow your assets?</strong></p>
            <p style="color: #713f12; margin: 0; font-size: 14px;">Log in to your dashboard to make your first deposit and start staking to earn daily interest.</p>
        </div>
        
        <p>If you have any questions or need assistance, our support team is always here to help.</p>
    `;

    try {
        await transporter.sendMail({
            from: '"Dhanix" <' + (process.env.SMTP_USER || 'noreply@dhanix.com') + '>',
            to: email,
            subject: title,
            html: getBaseEmailTemplate(title, content),
        })
        return true
    } catch (error) {
        console.error('Welcome email send error:', error)
        return false
    }
}

export async function sendTransferSentEmail(senderEmail: string, recipientEmail: string, amount: number): Promise<boolean> {
    const title = 'Transfer Sent Successfully';
    const content = `
        <p>Hello,</p>
        <p>You have successfully transferred USDT to another user.</p>
        
        <div class="box" style="background: #f8fafc; border-color: #cbd5e1;">
            <p class="box-text" style="color: #475569;">Amount Sent</p>
            <div class="box-value" style="color: #dc2626;">-${amount} USDT</div>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px;"><strong>Recipient:</strong> ${recipientEmail}</p>
        </div>
        
        <p>Thank you for using Dhanix.</p>
    `;

    try {
        await transporter.sendMail({
            from: '"Dhanix" <' + (process.env.SMTP_USER || 'noreply@dhanix.com') + '>',
            to: senderEmail,
            subject: 'Dhanix - ' + title,
            html: getBaseEmailTemplate(title, content),
        })
        return true
    } catch (error) {
        console.error('Transfer sent email error:', error)
        return false
    }
}

export async function sendTransferReceivedEmail(recipientEmail: string, senderEmail: string, amount: number): Promise<boolean> {
    const title = 'You Received a Transfer';
    const content = `
        <p>Hello,</p>
        <p>You have received a USDT transfer from another user.</p>
        
        <div class="box" style="background: #fdfaf0; border-color: #fde68a;">
            <p class="box-text" style="color: #713f12;">Amount Received</p>
            <div class="box-value" style="color: #16a34a;">+${amount} USDT</div>
        </div>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px;"><strong>Sender:</strong> ${senderEmail}</p>
        </div>
        
        <p>The funds are now available in your Dhanix wallet.</p>
    `;

    try {
        await transporter.sendMail({
            from: '"Dhanix" <' + (process.env.SMTP_USER || 'noreply@dhanix.com') + '>',
            to: recipientEmail,
            subject: 'Dhanix - ' + title,
            html: getBaseEmailTemplate(title, content),
        })
        return true
    } catch (error) {
        console.error('Transfer received email error:', error)
        return false
    }
}
