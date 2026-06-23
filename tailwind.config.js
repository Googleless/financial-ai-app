/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.vue',
    './layouts/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A7A59',
        'bg-light': '#D9D9D9',
        'danger': '#A52C2C',
        'light-green': '#C6DBC6',
      },
      fontFamily: {
        sans: ['Inter', 'NT Somic', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 6px rgba(0,0,0,0.15)',
        'card-elevated': '0 4px 12px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};