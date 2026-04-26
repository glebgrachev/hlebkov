/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FDF8F0',
        'warm-card': '#FFFFFF',
        'primary': '#D96E2A',
        'primary-dark': '#B8531E',
        'text-dark': '#2D2B26',
        'text-mid': '#6B635C',
        'border': '#EDE6DD',
        'success': '#2E7D32',
      },
      fontFamily: {
        'display': ['Cormorant Garamond', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}