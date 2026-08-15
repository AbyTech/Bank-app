import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeftRight, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react'
import { motion } from 'framer-motion'
import DebitCard from '../../components/UI/DebitCard'

const avatarGradients = [
  'from-gold to-gold-600',
  'from-primary-500 to-primary-700',
  'from-success to-green-600',
]

const LandingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-cream to-white dark:from-primary-900 dark:via-primary-900 dark:to-primary-900">
      <div className="pointer-events-none absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-primary-100/80 dark:bg-primary-800/50 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* ============ Left: copy ============ */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-gold uppercase">
              <span className="w-8 h-px bg-gold" />
              SIMPLE, QUICK, SECURED
            </p>

            <h1 className="mt-5 font-heading font-bold text-4xl sm:text-5xl xl:text-6xl leading-[1.08] text-primary dark:text-cream">
              Transfer Money Across The World In Real Time
            </h1>

            <p className="mt-6 text-base sm:text-lg text-silver leading-relaxed max-w-xl">
              PrimeWave Bank transformed the digital banking industry using data and technology more than ten years ago. We are now one of the largest digital banking providers, dedicated to innovating, simplifying, and humanizing banking.
            </p>

            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all"
              >
                Online Banking
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-silver">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-success" />
                Bank-grade security
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe2 size={16} className="text-primary-600" />
                Global transfers in 9+ currencies
              </span>
            </div>
          </motion.div>

          {/* ============ Right: visual ============ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative max-w-md mx-auto lg:max-w-none"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 sm:p-10 overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative mx-auto max-w-[19rem] sm:max-w-sm -rotate-3 hover:rotate-0 transition-transform duration-500">
                <DebitCard cardNumber="4242 4242 4242 4242" cardName="PRIMEWAVE USER" expiry="12/28" cvv="•••" />
              </div>

              <div className="relative mt-6 mx-auto max-w-sm rounded-2xl bg-white/95 backdrop-blur p-3.5 shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <ArrowLeftRight size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary">Transfer Complete</p>
                    <p className="text-[11px] text-silver truncate">$500.00 → ₦812,500.00</p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-success shrink-0" />
              </div>
            </div>

            {/* Trust indicator */}
            <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-white dark:bg-primary-800 border border-silver/30 dark:border-primary-700 shadow-lg px-4 py-2.5">
              <div className="flex -space-x-2">
                {avatarGradients.map((g, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-full border-2 border-white dark:border-primary-800 bg-gradient-to-br ${g} flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {['AK', 'JM', 'SO'][i]}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-primary dark:text-cream">
                Trusted by <span className="text-primary-600 dark:text-gold-300">18+ M</span> active users
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero
