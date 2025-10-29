/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#fceabb',
          dark: '#b8860b',
        },
        baseblue: '#2a6fff',
        darkbg: '#0a0a0a',
      },
      boxShadow: {
        gold: '0 0 20px rgba(212,175,55,0.5)',
      },
      animation: {
        'gold-glow': 'gold-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'gold-glow': {
          '0%, 100%': { textShadow: '0 0 10px #d4af37, 0 0 20px #f9e076' },
          '50%': { textShadow: '0 0 25px #ffd700, 0 0 50px #ffedb3' },
        },
        
      },
    },
  },
  theme: {
  extend: {
    keyframes: {
      pulseGold: {
        '0%, 100%': { opacity: '0.6', boxShadow: '0 0 12px rgba(212,175,55,0.4)' },
        '50%': { opacity: '1', boxShadow: '0 0 24px rgba(212,175,55,0.7)' },
      },
    },
    animation: {
      pulseGold: 'pulseGold 3s ease-in-out infinite',
    },
  },
},

  plugins: [require('@tailwindcss/typography')],
};
