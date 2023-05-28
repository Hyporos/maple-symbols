/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      'dark' : '#212121',
      'transparent' : 'transparent',
      'text' : '#dedede',
      'primary' : '#b18bd0',
      'secondary' : '#404040',
      'tertiary' : 'transparent',
    },
    fontFamily: {
      'maven-pro' : ['Maven Pro','sans-serif'],
    }
  },
  plugins: [],
}

