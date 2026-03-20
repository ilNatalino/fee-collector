import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#6366f1', // indigo-500
          light: '#818cf8',   // indigo-400
          dark: '#4f46e5',    // indigo-600
        },
      },
      borderRadius: {
        '4xl': '32px',
      },
    },
  },
  plugins: [],
} satisfies Config;
