/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0b0f19',
          900: '#0f172a',
          850: '#151e32',
          800: '#1e293b',
          700: '#334155'
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '70%': { transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(245, 158, 11, 0.7)' }
        }
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        popIn: 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        glowPulse: 'glowPulse 2s infinite'
      }
    }
  },
  plugins: []
};
