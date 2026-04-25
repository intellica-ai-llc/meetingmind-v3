/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep old palette (used by /app console)
        'meetingmind': {
          bg: '#020b18',
          card: '#0d1f35',
          gold: '#f59e0b',
          cyan: '#0ea5e9',
          purple: '#8b5cf6',
        },
        // New v4 palette (will be used by dashboard and sidebar)
        'mm': {
          'bg-primary': '#0A0B1A',
          'bg-secondary': '#0F1130',
          'bg-elevated': '#161842',
          'cyan': '#00D4FF',
          'purple': '#7B61FF',
          'success': '#00C896',
          'warning': '#FFB547',
          'danger': '#FF4D6A',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'drift': 'gridDrift 20s linear infinite',
      }
    },
  },
  plugins: [],
}