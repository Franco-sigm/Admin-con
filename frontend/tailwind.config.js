/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Aquí definimos los "pasos" del movimiento (Giro en eje Y)
      keyframes: {
        trompo: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      // 2. Aquí creamos la clase 'animate-trompo'
      animation: {
        // nombre | duración | suavizado | repetición
        trompo: "trompo 3s linear infinite", 
      },
    },
  },
  plugins: [],
};