/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#f0f4f8',
            100: '#d9e2ec',
            500: '#1b365d',
            800: '#0f2240',
            900: '#0c1833',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
        },
      },
    },
  },
  plugins: [],
}
