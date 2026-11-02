/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        step: 'var(--step)',
        ink: 'var(--ink)',
        soft: 'var(--soft)',
        thread: 'var(--thread)',
      },
    },
  },
  plugins: [],
}
