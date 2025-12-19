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
        cream: "#FFF8E7",
        primary: {
          DEFAULT: "#111111",
          900: "#1A1A1A"
        },
        silver: "#A0A0A0",
        gold: {
          DEFAULT: "#ffde25ff",
          600: "#E6BE00"
        },
        success: "#28A745"
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        playfair: ['Playfair Display', 'serif']
      }
    },
  },
  plugins: [],
}