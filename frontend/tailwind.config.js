/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
       fontFamily:{
         sans: ["Kanit", "sans-serif"],   // override font-sans ทั้งเว็บ
        kanit: ["Kanit", "sans-serif"],  // ฟอนต์แบบกำหนดเองก็ได้
       },
    },
  },
  plugins: [],
}

