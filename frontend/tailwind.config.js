/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Industry-grade neutral dark/light surfaces (Zinc based)
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1e1e24',
          900: '#18181b',
          925: '#121215',
          950: '#09090b',
        },
        ide: {
          bg: '#09090b',
          sidebar: '#0d0d11',
          panel: '#121215',
          editor: '#0e0e12',
          border: '#27272a',
          borderMuted: '#1f1f23',
          hover: '#1e1e24',
          active: '#27272a',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
}
