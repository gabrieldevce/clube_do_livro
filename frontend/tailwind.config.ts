import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef7ee', 100: '#fdedd6', 200: '#f9d7ad', 300: '#f4ba79', 400: '#ee9343', 500: '#ea7620', 600: '#db5c16', 700: '#b54414', 800: '#903718', 900: '#742f16', 950: '#3f1509' },
        accent: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d99', 950: '#2e1065' },
      },
    },
  },
  plugins: [],
};
export default config;
