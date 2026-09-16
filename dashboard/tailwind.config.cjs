/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flora: {
          'deep': '#1E2805',
          'primary-dark': '#1E2805',
          'primary': '#597C00',
          'secondary': '#658406',
          'accent': '#9DB312',
          'botanical': '#597C00',
          'light-accent': '#C3D883',
          'mist': '#F0F4E8',
          'canvas': '#F7FAF8',
          'surface': '#FFFFFF',
          'surface-subtle': '#F4F7F2',
          'ink': '#1B2408',
          'muted': '#617253',
          'line': '#E2E8DC',
          'line-subtle': '#EEF2EA',
        },
        status: {
          healthy: {
            bg: '#EAF4E8',
            text: '#22531A',
            border: '#C4E1BF',
            dot: '#367C29',
          },
          moderate: {
            bg: '#FEF7E8',
            text: '#8A570C',
            border: '#FDE3B5',
            dot: '#D97706',
          },
          high: {
            bg: '#FEEAEA',
            text: '#961C1C',
            border: '#FCCECE',
            dot: '#DC2626',
          },
          powdery: {
            bg: '#FFF3E6',
            text: '#9E450E',
            border: '#FDD8B3',
            dot: '#EA580C',
          },
          rust: {
            bg: '#FAF0EB',
            text: '#852F17',
            border: '#F5D2C5',
            dot: '#B43E1F',
          },
        }
      },
      boxShadow: {
        flora: '0 2px 10px rgba(30, 40, 5, 0.04)',
        'flora-md': '0 4px 16px rgba(30, 40, 5, 0.07)',
        'flora-lg': '0 8px 24px rgba(30, 40, 5, 0.09)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};
