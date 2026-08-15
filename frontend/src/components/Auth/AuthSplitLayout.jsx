import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import logo from '../../assets/logo.png'

/**
 * Shared two-column authentication layout.
 * - Teal greeting panel (brand color #18504D) with decorative shapes/animations
 * - White form panel, separated and clean
 * Both panels live inside a contained, rounded card so the page never bleeds
 * edge-to-edge. Responsive: stacks on mobile (greeting first, then the form).
 *
 * @param {'left'|'right'} tealSide - which side hosts the teal greeting panel
 */
const AuthSplitLayout = ({
  tealSide = 'left',
  badge = 'Secure digital banking',
  title,
  subtitle,
  points = [],
  children,
}) => {
  const tealOnLeft = tealSide === 'left'

  return (
    <div className="min-h-dvh bg-[#F8F8F8] overflow-x-hidden flex flex-col px-4 sm:px-6 py-6 sm:py-8">
      {/* Subtle page-level background accents */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-primary-100/80 blur-3xl" />

      {/* Contained card */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl 2xl:max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row bg-white m-auto">
        {/* ================= Teal greeting panel ================= */}
        <div
          className={`relative overflow-hidden bg-primary-600 text-white px-6 sm:px-10 lg:px-12 lg:w-1/2 py-10 lg:py-12 flex flex-col justify-center order-1 ${
            tealOnLeft ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          {/* Decorative layers */}
          <div className="pointer-events-none absolute -top-28 -right-24 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary-400/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 left-1/4 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          {/* Floating shapes */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="pointer-events-none absolute top-16 right-12 w-4 h-4 rounded-full bg-gold/70"
          />
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
            className="pointer-events-none absolute top-40 right-24 w-2.5 h-2.5 rounded-full bg-white/60"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="pointer-events-none absolute bottom-36 left-10 w-3 h-3 rounded-full bg-gold-300/80"
          />

          <div className="relative max-w-xl w-full mx-auto">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <img
                src={logo}
                alt="Primewave Logo"
                className="w-11 h-11 rounded-xl bg-primary ring-2 ring-gold/60"
              />
              <div>
                <p className="font-heading font-bold text-xl leading-tight">Primewave</p>
                <p className="text-[10px] font-semibold text-gold-300 tracking-[0.3em]">BANK</p>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold-200 text-xs font-semibold">
                <Sparkles size={13} />
                {badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-4 font-heading font-bold text-3xl sm:text-4xl xl:text-5xl leading-tight"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-3 text-white/80 text-base sm:text-lg leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Feature points */}
            {points.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-7 space-y-4"
              >
                {points.map((p) => (
                  <li key={p.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <p.icon size={18} className="text-gold-300" />
                    </div>
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-sm text-white/70 mt-0.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </li>
                ))}
              </motion.ul>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-sm text-white/40"
            >
              © 2026 Primewave Bank. All rights reserved.
            </motion.p>
          </div>
        </div>

        {/* ================= Form panel ================= */}
        <div
          className={`relative bg-[#F8F8F8] flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-12 py-10 lg:py-12 order-2 ${
            tealOnLeft ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-lg relative"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthSplitLayout
