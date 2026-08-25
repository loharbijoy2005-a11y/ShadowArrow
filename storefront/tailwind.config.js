/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Sora', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
      },
      colors: {
        shadow: {
          dark: '#0f172a',
          accent: '#2563eb',
          cardLight: '#ffffff',
          cardDark: '#1e293b',
        },
        stitch: {
          bg: '#050505',
          surface: '#121414',
          container: '#1e2020',
          elevated: '#0d0e0f',
          primary: '#00e0ff',
          primaryDim: '#00daf8',
          text: '#e3e2e2',
          muted: '#bac9cd',
          border: '#343535',
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
