/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e53e3e',
        secondary: '#4a5568',
        accent: '#ffd700',
        dark: {
          DEFAULT: '#1a0f0f',
          lighter: '#2d1f1f',
          darker: '#0f0808',
        },
        light: {
          DEFAULT: '#e9e9e9',
          darker: '#d4d4d4',
        },
        blood: {
          light: '#ff4040',
          DEFAULT: '#8b0000',
          dark: '#4a0404',
        }
      },
      fontFamily: {
        gothic: ['MedievalSharp', 'serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'texture': "url('/textures/dark-texture.png')",
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-in',
      },
      zIndex: {
        '1': '1',
      },
    },
  },
  plugins: [],
  darkMode: 'class'
}