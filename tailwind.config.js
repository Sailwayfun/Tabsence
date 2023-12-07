/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./newTab.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};