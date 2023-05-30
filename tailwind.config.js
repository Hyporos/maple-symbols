/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'card' : '0 0 50px -12px rgb(0 0 0 / 0.25)',
        'input' : '0 0 5px 0px rgb(0 0 0 / 0.25)'
      },
      textColor: {
        'primary' : '#ffffff',
      },
      backgroundColor: {
        'card' : '#1c1c1c',
        
      },
      colors: {
        'dark' : '#212121',
        'accent' : '#b18bd0',
        'secondary' : '#333333',
        'secondary-border' : '#8b6aa6',
        'tertiary' : 'transparent',
        'unchecked' : '#a30000',
        'checked' : '#00ad08',
        'upgrade' : '#e0e000',
      },
    },
    fontFamily: {
      'maven-pro' : ['Maven Pro','sans-serif'],
    }
  },
  plugins: [],
}

