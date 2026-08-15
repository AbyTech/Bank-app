import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users, Globe2, RefreshCcw, ShieldCheck, Banknote } from 'lucide-react'
import { motion } from 'framer-motion'
import DebitCard from '../../components/UI/DebitCard'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

const stats = [
  { icon: Users, value: '18+ M', label: 'Active users worldwide' },
  { icon: Globe2, value: '150+', label: 'Countries supported' },
  { icon: Banknote, value: '9+', label: 'Currencies held' },
  { icon: RefreshCcw, value: '24/7', label: 'Real-time banking' },
]

const LandingShowcase = () => {
  return (
    <>
      {/* ============ Debit Card Section ============ */}
      <section className="py-16 sm:py-24 bg-cream dark:bg-primary-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp} className="order-2 lg:order-1">
              <p className="text-xs font-bold tracking-[0.25em] text-gold uppercase">Debit Card</p>
              <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-primary dark:text-cream">
                A Premium Card In Your Pocket
              </h2>
              <p className="mt-5 text-base sm:text-lg text-silver leading-relaxed">
                Order a virtual or physical debit card in minutes. Realistic design, contactless payments, and complete control from the Cards dashboard - freeze it, track it, and use it anywhere VISA is accepted.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Virtual and physical options',
                  'Contactless + EMV chip enabled',
                  'Real-time spending notifications',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-primary dark:text-cream">
                    <Sparkles size={15} className="text-gold shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
              >
                Get Your Card
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <div className="relative max-w-sm mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-gold/20 to-primary-600/10 blur-2xl" />
                <DebitCard cardNumber="5399 8421 0607 4242" cardName="PRIMEWAVE USER" expiry="08/29" cvv="•••" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ Statistics / Trust ============ */}
      <section className="py-16 sm:py-24 bg-white dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-gold uppercase">Our Numbers</p>
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-primary dark:text-cream">
              Banking At Scale
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                {...fadeUp}
                className="p-6 sm:p-8 rounded-2xl bg-cream dark:bg-primary-800 border border-silver/20 dark:border-primary-700 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-600/10 text-primary-600 dark:text-gold-300 flex items-center justify-center mb-4">
                  <s.icon size={22} />
                </div>
                <p className="font-heading font-bold text-3xl sm:text-4xl text-primary dark:text-cream">{s.value}</p>
                <p className="mt-1 text-sm text-silver">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Call To Action ============ */}
      <section className="py-16 sm:py-24 bg-primary-600 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp}>
            <ShieldCheck size={40} className="mx-auto text-gold-200" />
            <h2 className="mt-6 font-heading font-bold text-3xl sm:text-5xl text-white leading-tight">
              Ready to experience smarter banking?
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Open your PrimeWave Bank account in under a minute and start transferring money across the world in real time.
            </p>
            <Link
              to="/register"
              className="mt-9 inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-cream focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 shadow-xl hover:shadow-2xl transition-all"
            >
              Create Your Account
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default LandingShowcase
