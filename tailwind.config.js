/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'maven-pro': ['Maven Pro', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 0 50px -12px rgb(0 0 0 / 0.25)',
        'input': '0 0 5px 0px rgb(0 0 0 / 0.25)',
      },
      textColor: {
        'primary': '#ffffff',
        'secondary': '#bfbfbf',
        'tertiary' : '#8c8c8c',
        'upgrade': '#00b800',
      },
      backgroundColor: {
        'dark': '#212121',
        'card': '#1c1c1c',
        'hover': '#444444',
        'secondary': '#333333',
        'tertiary': 'transparent',
      },
      borderColor: {
        'unchecked': '#8c0000',
        'checked': '#008c00',
      },
      outlineColor: {
        'basic': '#444444',
      },
      translate: {
        'symbol': '-7.5px',
      },
      fill: {
        'hover': '#ffffff',
        'basic': '#bfbfbf',
      },
      colors: {
        'accent': '#b18bd0',
      },
    },
  },
  plugins: [],
}

