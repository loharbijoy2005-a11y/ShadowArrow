/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shadow: {
          dark: '#0f172a',
          accent: '#2563eb',
          cardLight: '#ffffff',
          cardDark: '#1e293b',
        },
      },
      animation: {
        'bg-cycle': 'bgCycle 60s infinite linear',
      },
      keyframes: {
        bgCycle: {
          '0%': { backgroundColor: '#ffffff' },
          '33%': { backgroundColor: '#e2e8f0' },
          '66%': { backgroundColor: '#1e293b' },
          '100%': { backgroundColor: '#ffffff' },
        },
      },
    },
  },
  plugins: [],
};
