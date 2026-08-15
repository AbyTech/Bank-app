import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send as TelegramIcon } from 'lucide-react'
import logo from '../../assets/logo.png'

const column = (title, links) => (
  <div>
    <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.label}>
          <Link to={l.to} className="text-sm text-white/60 hover:text-gold-300 transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const LandingFooter = () => {
  return (
    <footer className="bg-primary-800 dark:bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={logo} alt="PrimeWave Bank" className="w-9 h-9 rounded-xl bg-primary ring-1 ring-gold/60" />
              <div className="leading-tight">
                <p className="font-heading font-bold text-lg">Primewave</p>
                <p className="text-[9px] font-semibold tracking-[0.3em] text-gold-300">BANK</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
              A modern digital bank built for speed, security and simplicity. Transfer money across the world in real time.
            </p>
          </div>

          {column('Navigation', [
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Transactions', to: '/transactions' },
            { label: 'Cards', to: '/cards' },
            { label: 'Loans', to: '/loans' },
            { label: 'Support', to: '/support' },
          ])}

          {column('Banking', [
            { label: 'Online Banking', to: '/register' },
            { label: 'Sign Up', to: '/register' },
            { label: 'Log In', to: '/login' },
          ])}

          {column('Company', [
            { label: 'Security', to: '/support' },
            { label: 'Privacy Policy', to: '/support' },
            { label: 'Terms of Service', to: '/support' },
          ])}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© 2026 PrimeWave Bank. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:helpxprimewavebank@gmail.com"
              aria-label="Email support"
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-gold-300 hover:border-gold-300/40 transition-colors"
            >
              <Mail size={16} />
            </a>
            <a
              href="https://t.me/helpxprimewavebank"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-gold-300 hover:border-gold-300/40 transition-colors"
            >
              <TelegramIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
