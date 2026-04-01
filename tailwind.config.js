
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: '#0A3D62', // Deep Blue
        secondary: '#74B9FF', // Sky Blue
        accent: '#FDCB6E', // Sunny Yellow
        softwhite: '#F8F9FA', // Background
        charcoal: '#2D3436', // Text
      },
    },
  },
  plugins: [],
}
