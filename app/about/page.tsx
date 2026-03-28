import { Metadata } from 'next'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'
import { Shield, Target, Users } from 'lucide-react'
import styles from './about.module.css'

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn more about Dhanix, the most secure and transparent USDT BEP20 staking platform.',
}

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <LandingNav />
            
            <main className={styles.main}>
                <h1 className={styles.heading}>
                    Empowering Your <span className={styles.gradientText}>Crypto Journey</span>
                </h1>
                
                <p className={styles.intro}>
                    Dhanix was founded with a single mission: to provide the most secure, transparent, and user-friendly USDT staking experience on the Binance Smart Chain.
                </p>

                <div className={styles.featureGrid}>
                    <div className={styles.featureRow}>
                        <div className={styles.iconContainer}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className={styles.featureTitle}>Security First</h3>
                            <p className={styles.featureDesc}>We prioritize the safety of your funds above all else, utilizing industry-leading encryption and secure smart contract standards.</p>
                        </div>
                    </div>

                    <div className={styles.featureRow}>
                        <div className={styles.iconContainer}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className={styles.featureTitle}>Transparency</h3>
                            <p className={styles.featureDesc}>Every transaction, stake, and reward is recorded on the blockchain, ensuring complete visibility and trust.</p>
                        </div>
                    </div>

                    <div className={styles.featureRow}>
                        <div className={styles.iconContainer}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className={styles.featureTitle}>Community Focused</h3>
                            <p className={styles.featureDesc}>We believe in shared growth. Our 3-level referral system and welcome bonuses are designed to reward our active community members.</p>
                        </div>
                    </div>
                </div>

                <div className={`card ${styles.visionCard}`}>
                    <h2 className={styles.visionTitle}>Our Vision</h2>
                    <p className={styles.visionDesc}>
                        To become the global standard for decentralized passive income, making crypto staking accessible and profitable for everyone, regardless of their technical expertise.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
