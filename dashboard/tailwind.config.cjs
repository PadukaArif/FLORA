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
          'primary-dark': '#17483B',
          'primary': '#2F6F5E',
          'botanical': '#58977F',
          'light-accent': '#8FBEA8',
          'mist': '#DCECE5',
          'canvas': '#F7FAF8',
          'surface': '#FFFFFF',
          'surface-subtle': '#F2F6F4',
          'ink': '#17332B',
          'muted': '#5C736B',
          'line': '#E2EAE6',
          'line-subtle': '#EEF3F0',
        },
        status: {
          healthy: {
            bg: '#E8F5E9',
            text: '#1B5E20',
            border: '#C8E6C9',
            dot: '#2E7D32',
          },
          moderate: {
            bg: '#FEF3C7',
            text: '#92400E',
            border: '#FDE68A',
            dot: '#D97706',
          },
          high: {
            bg: '#FEE2E2',
            text: '#991B1B',
            border: '#FECACA',
            dot: '#DC2626',
          },
          powdery: {
            bg: '#FFEDD5',
            text: '#9A3412',
            border: '#FED7AA',
            dot: '#EA580C',
          },
          rust: {
            bg: '#FDF2E9',
            text: '#7C2D12',
            border: '#FBD5B5',
            dot: '#9A3412',
          },
        }
      },
      boxShadow: {
        flora: '0 2px 10px rgba(23, 72, 59, 0.04)',
        'flora-md': '0 4px 16px rgba(23, 72, 59, 0.07)',
        'flora-lg': '0 8px 24px rgba(23, 72, 59, 0.09)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
};
