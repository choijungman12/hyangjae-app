/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          'bounce-in': {
            '0%':   { opacity: '0', transform: 'translate(-50%, 20px) scale(0.85)' },
            '60%':  { opacity: '1', transform: 'translate(-50%, -6px) scale(1.04)' },
            '100%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
          },
          fadeIn: {
            '0%':   { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%':   { opacity: '0', transform: 'translateY(16px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'stamp-pop': {
            '0%':   { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
            '60%':  { transform: 'scale(1.2) rotate(5deg)',  opacity: '1' },
            '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
          },
          'harvest-glow': {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.45)' },
            '50%':      { boxShadow: '0 0 0 10px rgba(52,211,153,0)' },
          },
          'ken-burns': {
            '0%':   { transform: 'scale(1.08) translate(0, 0)' },
            '50%':  { transform: 'scale(1.18) translate(-1.5%, -1.5%)' },
            '100%': { transform: 'scale(1.08) translate(0, 0)' },
          },
          'slide-in-left': {
            '0%':   { opacity: '0', transform: 'translateX(-24px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
          shimmer: {
            '0%':   { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(200%)' },
          },
          'pulse-ring': {
            '0%':   { transform: 'scale(0.9)', opacity: '0.8' },
            '100%': { transform: 'scale(1.8)', opacity: '0' },
          },
        },
        animation: {
          'bounce-in':    'bounce-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fadeIn:         'fadeIn 0.3s ease-in',
          slideUp:        'slideUp 0.35s ease-out',
          'stamp-pop':    'stamp-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          'harvest-glow': 'harvest-glow 2.2s ease-in-out infinite',
          'ken-burns':    'ken-burns 12s ease-in-out infinite',
          'slide-in-left':'slide-in-left 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          shimmer:        'shimmer 2.5s linear infinite',
          'pulse-ring':   'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
    },
    plugins: [],
  }
