import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
