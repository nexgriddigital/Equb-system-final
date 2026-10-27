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
          green: '#0E3B2E',
          'green-dark': '#07241C',
          gold: '#F2B705',
          cream: '#FFF1CC',
        },
      },
      fontFamily: {
        body: ['Figtree', 'Noto Sans Ethiopic', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Fraunces', 'Noto Serif Ethiopic', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
