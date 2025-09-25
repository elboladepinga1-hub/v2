/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#121212',
        secondary: '#D4AF37',
        accent: '#F5F5DC',
        background: '#FFFFFF',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
      },
      spacing: {
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};