/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",         // Escanea tu index.html principal
    "./src/**/*.{html,js}"  // Escanea TODOS los .html y .js dentro de src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}