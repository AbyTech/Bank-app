import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Globe2,
  RefreshCcw,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  ReceiptText,
  BarChart3,
  Lock,
  Fingerprint,
  Send,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
    <p className="text-xs font-bold tracking-[0.25em] text-gold uppercase">{eyebrow}</p>
    <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-primary dark:text-cream">
      {title}
    </h2>
    {subtitle && <p className="mt-4 text-base sm:text-lg text-silver leading-relaxed">{subtitle}</p>}
  </motion.div>
)

const FeatureCard = ({ icon: Icon, title, desc, color = 'bg-primary-600/10 text-primary-600' }) => (
  <motion.div
    {...fadeUp}
    className="group p-6 sm:p-7 rounded-2xl bg-white dark:bg-primary-800 border border-silver/20 dark:border-primary-700 shadow-lux-card hover:-translate-y-1 hover:shadow-xl transition-all"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
      <Icon size={22} />
    </div>
    <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">{title}</h3>
    <p className="mt-2 text-sm text-silver leading-relaxed">{desc}</p>
  </motion.div>
)

const benefits = [
  { icon: Zap, title: 'Fast Transfers', desc: 'Send money anywhere in real time with near-instant settlement.', color: 'bg-gold/15 text-gold' },
  { icon: ShieldCheck, title: 'Secure Banking', desc: 'Encrypted transactions and a private recovery phrase keep your money safe.', color: 'bg-success/15 text-success' },
  { icon: Smartphone, title: 'Easy Account Management', desc: 'Manage everything from your phone - balance, cards, loans and more.', color: 'bg-primary-600/10 text-primary-600' },
  { icon: Globe2, title: 'Global Accessibility', desc: 'Open an account from 150+ countries and bank across borders with ease.', color: 'bg-primary-600/10 text-primary-600' },
  { icon: RefreshCcw, title: 'Real-Time Transactions', desc: 'Live balances and instant notifications on every single transaction.', color: 'bg-gold/15 text-gold' },
]

const features = [
  { icon: ArrowLeftRight, title: 'Money Transfers', desc: 'Instant internal transfers with automatic currency conversion.', color: 'bg-primary-600/10 text-primary-600' },
  { icon: CreditCard, title: 'Debit Cards', desc: 'Virtual and physical cards with a premium look and full control.', color: 'bg-gold/15 text-gold' },
  { icon: Landmark, title: 'Loans', desc: 'Personal loans with instant approval and same-day funding.', color: 'bg-success/15 text-success' },
  { icon: ReceiptText, title: 'Transaction Management', desc: 'Search, filter and export your complete transaction history.', color: 'bg-primary-600/10 text-primary-600' },
  { icon: BarChart3, title: 'Account Statistics', desc: 'Track income, expenses and activity with clear visual insights.', color: 'bg-gold/15 text-gold' },
  { icon: Lock, title: 'Secure Digital Banking', desc: 'Bank with confidence backed by industry-grade security.', color: 'bg-success/15 text-success' },
]

const LandingSections = () => {
  return (
    <>
      {/* ============ Why Choose PrimeWave ============ */}
      <section className="py-16 sm:py-24 bg-white dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Why Choose PrimeWave Bank"
            subtitle="Everything you need to bank smarter - built around speed, security and simplicity."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => <FeatureCard key={b.title} {...b} />)}
            <motion.div
              {...fadeUp}
              className="p-6 sm:p-7 rounded-2xl bg-primary-600 text-white shadow-lux-card flex flex-col justify-center"
            >
              <h3 className="font-heading font-semibold text-xl">18+ million users trust us</h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Join a global community banking on PrimeWave every single day.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ Banking Features ============ */}
      <section className="py-16 sm:py-24 bg-cream dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Features"
            title="Banking Features"
            subtitle="A complete suite of modern banking tools, all in one place."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ============ Global Banking / Transfers ============ */}
      <section className="py-16 sm:py-24 bg-white dark:bg-primary-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="text-xs font-bold tracking-[0.25em] text-gold uppercase">Global Banking</p>
              <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-primary dark:text-cream">
                Send Money Across The World
              </h2>
              <p className="mt-5 text-base sm:text-lg text-silver leading-relaxed">
                Move money between accounts, currencies and countries in real time. PrimeWave handles the conversion automatically with live exchange rates, so your recipient always gets the right amount.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Automatic currency conversion in 9+ currencies',
                  'Instant internal transfers, 24/7',
                  'Clear fees and real-time notifications',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-primary dark:text-cream">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeUp} className="relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 sm:p-8 overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
                <div className="relative space-y-4">
                  {[
                    { from: 'USD', to: 'NGN', amount: '$500.00', converted: '₦812,500.00' },
                    { from: 'EUR', to: 'GBP', amount: '€300.00', converted: '£258.20' },
                    { from: 'GHS', to: 'USD', amount: '₵1,200.00', converted: '$96.00' },
                  ].map((t) => (
                    <div key={t.from + t.to} className="flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3.5 shadow-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-600/10 text-primary-600 flex items-center justify-center shrink-0">
                          <Send size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary">{t.from} → {t.to}</p>
                          <p className="text-[11px] text-silver truncate">{t.amount} converted</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-primary-600 shrink-0">{t.converted}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ Security ============ */}
      <section className="py-16 sm:py-24 bg-primary-600 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-gold-200 uppercase">Security</p>
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
              Your Money, Protected
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
              Security is built into every layer of PrimeWave Bank.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Account Security', desc: 'Encrypted passwords and a private 12-word recovery phrase keep your account yours.' },
              { icon: ShieldCheck, title: 'Transaction Protection', desc: 'Every transfer is verified and monitored for suspicious activity.' },
              { icon: Fingerprint, title: 'Data Protection', desc: 'Your personal and financial data is encrypted at rest and in transit.' },
              { icon: RefreshCcw, title: 'Secure Digital Banking', desc: 'Session tokens and account controls stop unauthorized access.' },
            ].map((s) => (
              <motion.div
                key={s.title}
                {...fadeUp}
                className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-white"
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4">
                  <s.icon size={20} className="text-gold-200" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default LandingSections
