/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de marca Codalia (fondo oscuro azulado)
        ink:    '#0F172A',  // fondo principal
        panel:  '#1E293B',  // tarjetas
        brand:  '#3B82F6',  // azul acento
      },
    },
  },
  plugins: [],
}
