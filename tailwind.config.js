/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        '70': '17.5rem',
      },
      spacing: {
        '70': '17.5rem',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s infinite',
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
        'ticker-scroll': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
      },
    },
  },
  plugins: [],
};