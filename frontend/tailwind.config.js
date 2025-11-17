/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b132b',
          50: '#e8eef8',
          100: '#ccd9f0',
          200: '#99b3e1',
          300: '#668ccb',
          400: '#3355a6',
          500: '#0b132b',
          600: '#091027',
          700: '#060b19',
          800: '#03050c',
          900: '#010105'
        },
        gold: {
          DEFAULT: '#d4af37',
          50: '#fbf6e5',
          100: '#f8efc7',
          200: '#f0df8f',
          300: '#e7cf57',
          400: '#ddbf2f',
          500: '#d4af37',
          600: '#b28e2b',
          700: '#8f6c20'
        },
        cream: {
          DEFAULT: '#f5f3ef'
        },
        silver: {
          DEFAULT: '#a0a0a0'
        },
        accent: {
          teal: '#2ab7a9',
          metallic: '#a7b0b8'
        },
        danger: '#e04646',
        success: '#2fb45f'
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'lux-card': '0 10px 30px rgba(11,19,43,0.15)',
        'lux-gold': '0 5px 15px rgba(212,175,55,0.3)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}