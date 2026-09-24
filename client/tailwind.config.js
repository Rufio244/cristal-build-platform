/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { ink: '#171536', violet: '#5d2ee8', coral: '#d84bb4' },
      boxShadow: { soft: '0 16px 45px rgba(48, 37, 110, .12)' },
    },
  },
  plugins: [],
};
