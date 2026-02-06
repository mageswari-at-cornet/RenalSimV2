/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'renal': {
          bg: '#0b1220',
          panel: '#121b2a',
          'panel-secondary': '#0f1725',
          border: '#1e2a3a',
          text: '#e9eef7',
          muted: '#9aa8bb',
        },
        'rs': {
          blue: '#2f7df6',
          green: '#23d18b',
          amber: '#ffb020',
          red: '#ff4d4f',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'kpi': ['30px', { lineHeight: '1.2', fontWeight: '900' }],
        'kpi-lg': ['36px', { lineHeight: '1.2', fontWeight: '900' }],
      },
      boxShadow: {
        'card': '0 6px 18px rgba(0,0,0,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}