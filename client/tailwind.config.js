/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin';
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    flowbite,
    tailwindScrollbar,
  ],
}
