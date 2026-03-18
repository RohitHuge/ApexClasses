/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apexBlue: '#1A0A62',
        apexDeep: '#0D0531',
        apexOrange: '#F24E1E',
        apexOrangeLight: '#FF8A00',
        apexLight: '#F8FAFC',
        bookPrimary: '#FF6600',
        bookSecondary: '#1A1A40',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        display: ["Public Sans", 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(242, 78, 30, 0.4)' },
          '100%': { boxShadow: '0 0 200px rgba(242, 78, 30, 0.8)' },
        }
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF8A00 0%, #F24E1E 100%)',
      }
    },
  },
  plugins: [],
}

