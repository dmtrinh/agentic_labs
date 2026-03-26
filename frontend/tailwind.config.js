/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde7ff',
          200: '#c3d2ff',
          300: '#9db3fd',
          400: '#7590fa',
          500: '#5b6ef5',
          600: '#4650e9',
          700: '#3b40d0',
          800: '#3337a8',
          900: '#2f3585',
        }
      }
    }
  },
  plugins: []
}
