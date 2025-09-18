/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mainColor: '#05716c',
      },
      fontFamily: {
        sans: ['Figtree'],
      },
    },
    screens: {
      '2xs': '380px',
      xs: '475px',
      '2md': '540px',
      pmd: '940px',
      ...defaultTheme.screens,
    },
  },
  plugins: [],
}
