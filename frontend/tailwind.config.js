/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
       fontFamily:{
         sans: ["Kanit", "sans-serif"],   
        kanit: ["Kanit", "sans-serif"],  
       },
    },
  },
  plugins: [],
}

