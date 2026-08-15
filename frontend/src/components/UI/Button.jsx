import React from 'react'
import { motion } from 'framer-motion'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gold text-white hover:bg-gold-600 hover:shadow-lux-gold focus:ring-gold',
    brand: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lux-card focus:ring-primary-600',
    secondary: 'bg-primary-100 dark:bg-primary-700 text-primary dark:text-cream hover:bg-primary-200 dark:hover:bg-primary-600 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
    ghost: 'text-primary dark:text-cream hover:bg-silver/20 focus:ring-silver'
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default Button