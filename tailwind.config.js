/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './gatsby-browser.tsx',
    './gatsby-ssr.tsx',
    './rootWrapper.tsx',
  ],
  theme: {
    extend: {
      colors: {
        // Space-separated RGB channels so /opacity modifiers work: bg-bg/50, text-fg/40 etc.
        bg: 'rgb(var(--pvr-bg) / <alpha-value>)',
        fg: 'rgb(var(--pvr-fg) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"ITC Lubalin Graph Std Demi"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
