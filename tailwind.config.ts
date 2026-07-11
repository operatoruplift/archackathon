import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F6F1E7',
          deep: '#EDE5D3',
        },
        ink: {
          DEFAULT: '#0C2F3A',
          soft: '#14495C',
        },
        teal: {
          DEFAULT: '#14556B',
          bright: '#1E7D96',
        },
        gold: {
          DEFAULT: '#C9972F',
          soft: '#E3B85C',
        },
        crystal: {
          cyan: '#3EC9C0',
          violet: '#7C5CFF',
          ice: '#BFE8F2',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-circ': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
