import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#c89456',
        sage: '#5d7d57',
        skyblue: '#4a6c8f',
        rose: '#b0584c',
        amber: '#c8902f',
        violet: '#7a5c8f',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter-tight)', 'sans-serif'],
        mono: ['var(--font-spline-mono)', 'monospace'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};

export default config;
