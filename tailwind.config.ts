import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0E0B08', // fundo principal
          900: '#151109', // fundo de seções
          800: '#1D1710', // cards
          700: '#2A2115', // bordas / hover
        },
        gold: {
          200: '#F7E3A6',
          300: '#F2D580',
          400: '#EAC15C', // realce claro (coroa)
          500: '#D4AF37', // dourado principal
          600: '#B4902B', // dourado escuro
          700: '#8C6E1F', // bronze / sombra
        },
        cream: '#F4EEDF',
        sand: '#B9AD93', // texto secundário
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F2D580 0%, #D4AF37 45%, #8C6E1F 100%)',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.25), 0 8px 30px -8px rgba(212,175,55,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
