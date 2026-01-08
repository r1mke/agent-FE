/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'honey': '#F59E0B',    // Amber-500
        'dark-grey': '#1F2937' // Gray-800
      }
    },
  },
  plugins: [],
}