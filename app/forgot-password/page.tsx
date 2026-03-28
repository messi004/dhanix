import { Metadata } from 'next'
import ForgotClient from './ForgotClient'

export const metadata: Metadata = {
    title: 'Forgot Password',
    robots: {
        index: false,
        follow: true,
    },
}

export default function ForgotPasswordPage() {
    return <ForgotClient />
}
