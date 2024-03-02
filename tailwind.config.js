/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
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
        'unchecked': '#ab0000',
        'checked': '#00a500',
        'secondary': '#333333',
      },
      outlineColor: {
        'basic': '#444444',
      },
      fill: {
        'basic': '#bfbfbf',
      },
      colors: {
        'accent': '#b18bd0',
        'card': '#1d1d1d',
        'dark': '#212121',
        'card-grad': '#1b1b1b',
        'card-tool': '#1c1c1c',
        'light': '#262626',
      },
      screens: {
        'laptop' : '1150px',
        'phone' : '550px',
      },
      transitionProperty: {
        'height': 'height'
      }
    },
  },
  plugins: [],
}

