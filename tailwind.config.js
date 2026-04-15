/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Tema gelap ala Gemini
      colors: {
        dark: "#131314",
        panel: "#1e1f20",
        hover: "#282a2c",
      }
    },
  },
  plugins: [],
}