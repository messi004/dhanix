import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Shield, TrendingUp, Users, Wallet, ChevronDown, ArrowRight,
  Zap, Lock, Gift, Send
} from 'lucide-react'
import Footer from '@/components/Footer'
import LandingNav from '@/components/LandingNav'
import ContactForm from '@/components/ContactForm'
import { getSetting } from '@/lib/settings'
import { getCurrentUser } from '@/lib/auth'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const interestRate = await getSetting('interest_rate')
  const description = `Earn up to ${interestRate}% APY on your USDT with Dhanix secure crypto staking platform. Passive income made simple on BSC.`

  return {
    title: `Earn Up To ${interestRate}% APY on USDT Staking`,
    description,
    openGraph: {
      title: `Dhanix – Earn Up To ${interestRate}% APY on USDT`,
      description,
    },
    twitter: {
      title: `Dhanix – Earn Up To ${interestRate}% APY on USDT`,
      description,
    }
  }
}

export default async function LandingPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  const interestRate = await getSetting('interest_rate')
  const minStake = await getSetting('min_stake')
  const minDeposit = await getSetting('min_deposit')
  const maxDeposit = await getSetting('max_deposit')
  const minWithdraw = await getSetting('min_withdraw')
  const maxWithdraw = await getSetting('max_withdraw')
  const withdrawPerDay = await getSetting('withdraw_per_day')
  const referralPercent = await getSetting('referral_percentage')
  const welcomeBonusPercent = await getSetting('welcome_bonus_percentage')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dhanix.com'

  const financialServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Dhanix Crypto Staking',
    url: baseUrl,
    description: `Earn up to ${interestRate}% APY on your USDT with Dhanix secure crypto staking platform.`,
    brand: 'Dhanix',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Crypto Staking'
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dhanix',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    sameAs: [
      // Add social links if available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${baseUrl}/contact`
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <LandingNav />

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 60%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)',
            marginBottom: 24, animation: 'fadeIn 0.5s ease-out'
          }}>
            <Zap size={14} /> Live on BSC Network
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900,
            lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1.5px',
            color: '#1a1a2e', animation: 'slideUp 0.6s ease-out'
          }}>
            Stake USDT.<br />
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Earn {interestRate}% APY.
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: '#64648b',
            maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7,
            animation: 'slideUp 0.7s ease-out'
          }}>
            The most secure and rewarding USDT BEP20 staking platform.
            Start earning passive income with as little as {minStake} USDT.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.8s ease-out' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Staking <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="btn btn-secondary btn-lg">Learn More</Link>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 40, marginTop: 64,
            animation: 'fadeIn 1s ease-out', flexWrap: 'wrap',
          }}>
            {[
              { value: `${interestRate}%`, label: 'Annual Return' },
              { value: `${minStake} USDT`, label: 'Min Stake' },
              { value: `${referralPercent}%`, label: 'Referral Reward' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="landing-section-heading" style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px', color: '#1a1a2e' }}>How It Works</h2>
          <p style={{ color: '#64648b', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Three simple steps to start earning passive income with Dhanix
          </p>
        </div>

        <div className="grid-3">
          {[
            { icon: <Wallet size={28} />, title: 'Deposit USDT', desc: `Send USDT BEP20 to your unique deposit address. Minimum ${minDeposit} USDT.` },
            { icon: <Lock size={28} />, title: 'Create a Pool', desc: `Stake your USDT with ${interestRate}% APY. Choose your duration and watch it grow.` },
            { icon: <TrendingUp size={28} />, title: 'Earn Interest', desc: 'Receive guaranteed interest on your staked amount. Withdraw anytime after maturity.' },
          ].map((step, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-primary)', margin: '0 auto 20px'
              }}>{step.icon}</div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-gradient)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, margin: '0 auto 16px'
              }}>{i + 1}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>{step.title}</h3>
              <p style={{ color: '#64648b', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', background: '#f8f9fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="landing-section-heading" style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px', color: '#1a1a2e' }}>Why Choose Dhanix?</h2>
            <p style={{ color: '#64648b', fontSize: 16 }}>Built for security, transparency, and maximum returns</p>
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            {[
              { icon: <Shield size={24} />, title: 'Bank-Grade Security', desc: 'Your funds are protected with enterprise-grade encryption and secure smart contracts on BSC.' },
              { icon: <TrendingUp size={24} />, title: `${interestRate}% Annual Return`, desc: 'Industry-leading interest rates on your staked USDT. Transparent and predictable earnings.' },
              { icon: <Users size={24} />, title: '3-Level Referral Rewards', desc: `Earn rewards up to 3 levels deep when your referrals make their first 3 stakes. Unlimited growth potential.` },
              { icon: <Gift size={24} />, title: 'Welcome Bonus', desc: `Get an instant ${welcomeBonusPercent}% bonus on your very first staking pool. Start earning from day one.` },
              { icon: <Send size={24} />, title: 'Zero-Fee Transfers', desc: 'Instantly transfer USDT to other users on the platform with absolutely zero transaction fees.' },
              { icon: <Zap size={24} />, title: 'Instant Operations', desc: 'Auto-detect deposits. Quick withdrawals. Real-time balance updates.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 16, padding: 24 }}>
                <div style={{
                  width: 48, height: 48, minWidth: 48, borderRadius: 12,
                  background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a1a2e' }}>{f.title}</h3>
                  <p style={{ color: '#64648b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 className="landing-section-heading" style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px', color: '#1a1a2e' }}>FAQ</h2>
          <p style={{ color: '#64648b', fontSize: 16 }}>Frequently asked questions</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { q: 'What is the minimum deposit?', a: `The minimum deposit is ${minDeposit} USDT BEP20. You can deposit up to ${maxDeposit} USDT per transaction.` },
            { q: 'How does staking work?', a: `When you create a staking pool, your USDT is locked for the chosen duration. You earn ${interestRate}% annual interest calculated daily. At maturity, your principal plus interest is returned to your wallet.` },
            { q: 'How do withdrawals work?', a: `You can withdraw from your wallet balance anytime. Minimum withdrawal is ${minWithdraw} USDT, maximum ${maxWithdraw} USDT. ${withdrawPerDay} withdrawal(s) per day is allowed.` },
            { q: 'How does the referral system work?', a: `Share your unique referral link. You earn rewards up to 3 levels deep for the first three staking pools created by each referral. Level 1 gets the full referral bonus, Level 2 gets 50% of that, and Level 3 gets 25%.` },
            { q: 'Is my money safe?', a: 'Yes. We use enterprise-grade security, encrypted wallets, and operate on the Binance Smart Chain for transparent transactions.' },
          ].map((faq, i) => (
            <details key={i} className="card" style={{ cursor: 'pointer' }}>
              <summary style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontWeight: 600, fontSize: 15, listStyle: 'none', color: '#1a1a2e',
              }}>
                {faq.q}
                <ChevronDown size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
              </summary>
              <p style={{ marginTop: 12, color: '#64648b', fontSize: 14, lineHeight: 1.7 }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.08) 0%, transparent 60%)',
      }}>
        <h2 className="landing-section-heading" style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px', color: '#1a1a2e' }}>
          Ready to Start Earning?
        </h2>
        <p style={{ color: '#64648b', fontSize: 16, marginBottom: 32, maxWidth: 450, margin: '0 auto 32px' }}>
          Join thousands of users earning passive income with Dhanix
        </p>
        <Link href="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '80px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="landing-section-heading" style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px', color: '#1a1a2e' }}>
          Get in Touch
        </h2>
        <p style={{ color: '#64648b', fontSize: 16, marginBottom: 40 }}>
          Have questions? Our team is here to help you.
        </p>
        <ContactForm />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
