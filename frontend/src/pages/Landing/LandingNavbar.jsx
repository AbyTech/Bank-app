import React from 'react'
import { Link } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import logo from '../../assets/logo.png'

const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-primary-900/90 backdrop-blur-md border-b border-silver/20 dark:border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="PrimeWave Bank" className="w-9 h-9 rounded-xl bg-primary ring-1 ring-gold/60 shrink-0" />
            <div className="leading-tight min-w-0">
              <p className="font-heading font-bold text-lg text-primary dark:text-cream truncate">Primewave</p>
              <p className="text-[9px] font-semibold tracking-[0.3em] text-gold">BANK</p>
            </div>
          </Link>

          {/* Auth actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Login */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 text-primary dark:text-cream font-semibold px-4 py-2.5 rounded-xl border border-silver/40 dark:border-primary-600 hover:border-primary-600 hover:text-primary-600 dark:hover:border-gold-300 dark:hover:text-gold-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/login"
              aria-label="Log in"
              className="sm:hidden inline-flex items-center justify-center p-2.5 rounded-xl border border-silver/40 dark:border-primary-600 text-primary dark:text-cream hover:border-primary-600 hover:text-primary-600 transition-colors"
            >
              <LogIn size={18} />
            </Link>

            {/* Sign Up */}
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/register"
              aria-label="Sign up"
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
            >
              <UserPlus size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingNavbar
