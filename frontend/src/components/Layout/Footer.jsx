import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-primary dark:bg-primary-900 text-cream border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gold to-gold-400 rounded-xl flex items-center justify-center">
                <span className="text-lg font-heading font-bold text-primary">P</span>
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-cream">Primewave</h2>
                <p className="text-xs text-gold font-semibold">BANK</p>
              </div>
            </div>
            <p className="text-silver text-sm mb-4">
              Luxury banking services for the modern global citizen. Secure, reliable, and premium.
            </p>
            <div className="flex items-center space-x-2 text-silver text-sm">
              <Shield size={16} />
              <span>256-bit SSL Encryption</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-silver">
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Personal Banking</Link></li>
              <li><Link to="/cards" className="hover:text-gold transition-colors">Card Services</Link></li>
              <li><Link to="/loans" className="hover:text-gold transition-colors">Loans & Credit</Link></li>
              <li><Link to="/transactions" className="hover:text-gold transition-colors">Transactions</Link></li>
              <li><Link to="/support" className="hover:text-gold transition-colors">Wealth Management</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-silver">
              <li><Link to="/support" className="hover:text-gold transition-colors">Contact Support</Link></li>
              <li><Link to="/support" className="hover:text-gold transition-colors">Help Center</Link></li>
              <li><Link to="/support" className="hover:text-gold transition-colors">Security Tips</Link></li>
              <li><Link to="/support" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-silver">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+1 (555) 123-PRIME</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>helpxprimewavebank@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Global Headquarters</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-silver text-sm">
            © 2024 Primewave Bank. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-silver hover:text-gold text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-silver hover:text-gold text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/security" className="text-silver hover:text-gold text-sm transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer