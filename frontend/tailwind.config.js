/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meetingmind': {
          bg: '#020b18',
          card: '#0d1f35',
          gold: '#f59e0b',
          cyan: '#0ea5e9',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'drift': 'gridDrift 20s linear infinite',
      }
    },
  },
  plugins: [],
}
