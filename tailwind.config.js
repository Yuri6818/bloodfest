/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b0000',
        secondary: '#1a0505',
        accent: '#9a7d0a',
        dark: {
          DEFAULT: '#0a0506',
          lighter: '#1a0f0f',
          darker: '#050203',
        },
        light: {
          DEFAULT: '#d4c1c1',
          darker: '#b0a0a0',
        },
        blood: {
          light: '#bb0000',
          DEFAULT: '#8b0000',
          dark: '#4a0000',
        },
        bone: {
          light: '#e8e6d9',
          DEFAULT: '#c7c4b8',
          dark: '#a49f90',
        },
        parchment: {
          light: '#f5f0e6',
          DEFAULT: '#e8dcc8',
          dark: '#d5c7ae',
        }
      },
      fontFamily: {
        gothic: ['MedievalSharp', 'serif'],
        serif: ['Crimson Pro', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-texture': "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23420000' fill-opacity='0.15'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'blood': '0 4px 14px -2px rgba(139, 0, 0, 0.8)',
        'inner-blood': 'inset 0 2px 4px 0 rgba(139, 0, 0, 0.4)',
      },
      animation: {
        'flicker': 'flicker 8s infinite alternate',
        'blood-drip': 'blood-drip 10s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': { opacity: 1 },
          '20%, 24%, 55%': { opacity: 0.8 },
        },
        'blood-drip': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
      dropShadow: {
        'blood': '0 0 8px rgba(139, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}