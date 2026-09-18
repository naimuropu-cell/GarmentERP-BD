/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Secondary: Soft Green
          600: '#059669',
          700: '#047857', // Primary: Deep Green
          800: '#065F46', // Primary: Deep Green
          900: '#064E3B',
          950: '#022c22'
        },
        app: {
          bg: '#F7F8FA',       // Background: very light gray
          card: '#FFFFFF',     // Cards: White
          border: '#E2E8F0',   // Borders: Very light gray
          text: '#0F172A',     // Text: Dark Slate
          muted: '#64748B',    // Muted slate
          accent: '#F59E0B',   // Accent: Amber/Gold
          'accent-light': '#FEF3C7'
        }
      }
    },
  },
  plugins: [],
}
