/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class', // Add this for dark mode support
  theme: {
    extend: {
      colors: {
        // Light neutral surfaces (page background / subtle fills)
        cream: "#F8F8F8",
        // Primary: near-black text + teal brand scale
        primary: {
          DEFAULT: "#181818",  // main text / dark logo
          50: "#F0F4F4",        // very light teal surface
          100: "#E8EEEE",       // light teal-gray (inputs, muted surfaces)
          200: "#E0E8E8",       // lighter teal-gray
          300: "#C9D8D8",
          400: "#2E6B67",
          500: "#1F5D59",
          600: "#18504D",       // teal brand (navbar, headers)
          700: "#123F3C",       // darker teal (dark-mode surfaces)
          800: "#0E3633",
          900: "#0B2B29",       // dark-mode page background
        },
        // Muted borders / secondary text
        silver: "#8f8e8e",
        // Brand accent (burnt-orange family)
        gold: {
          DEFAULT: "#BB6125",   // primary CTA / accent
          100: "#F3E1D5",       // peach highlight
          200: "#EAC4A6",
          300: "#DD9158",
          400: "#CD7336",
          500: "#C16A2D",
          600: "#984C1D",       // darker orange (hover)
          700: "#7C3D15",
        },
        // Semantic states
        danger: {
          DEFAULT: "#D64541",
          light: "#FAE9E8",
          dark: "#B23530",
        },
        success: "#28A745",
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        heading: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'lux-card': '0 4px 24px rgba(18, 63, 60, 0.10)',
        'lux-gold': '0 4px 16px rgba(187, 97, 37, 0.30)',
      }
    },
  },
  plugins: [],
}