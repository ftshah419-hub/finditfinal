/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#101C36',
          blue: '#2457E8',
          lightBlue: '#4D8DFF',
          bg: '#F4F7FC',
          border: '#DCE4F0',
          muted: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
