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
        'input': '0 0 9px 0px rgb(0 0 0 / 0.25)',
        'level': '0 0 2.5px 0px rgb(0 0 0 / 0.1)',
      },
      textColor: {
        'primary': '#ffffff',
        'secondary': '#bfbfbf',
        'tertiary': '#8c8c8c',
        'upgrade': '#00b800',
      },
      backgroundColor: {
        'hover': '#444444',
        'secondary': '#333333',
        'tertiary': 'transparent',
      },
      borderColor: {
        'unchecked': '#8c0000',
        'checked': '#008c00',
        'secondary': '#333333',
      },
      outlineColor: {
        'basic': '#444444',
      },
      translate: {
        'symbol': '-7.5px',
        'level': '-40px',
      },
      fill: {
        'hover': '#ffffff',
        'basic': '#bfbfbf',
      },
      colors: {
        'accent': '#b18bd0',
        'card': '#1c1c1c',
        'dark': '#212121',
        'light': '#262626',
      },
      transitionDuration: {
        '250': '250ms'
      },
    },
  },
  plugins: [],
}

