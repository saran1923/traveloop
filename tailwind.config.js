/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        sig: 'var(--sig)',
        'sig-dim': 'var(--sig-dim)',
        border: 'var(--border)',
        'border-active': 'var(--border-active)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'sig-glow': '0 0 24px var(--sig-glow)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
