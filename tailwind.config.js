/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#FAF7F2',
        ink: '#1A1815',
        clay: '#C75D3C',
        'clay-dark': '#A8492F',
        sage: '#8A9A7E',
        gold: '#B8935F',
        stone: '#E8E2D6',
        'stone-dark': '#D4CBB8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      rotate: {
        2.5: '2.5deg',
        '-2.5': '-2.5deg',
      },
    },
  },
  plugins: [],
}
