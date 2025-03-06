/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2d4b5f',
        secondary: '#f8f9fa',
        border: '#e2e8f0',
        'text-base': '#334155',
        'text-light': '#64748b',
        'visma-blue': '#345b63', // Add the specific blue color
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
