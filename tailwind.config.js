/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    // fontFamily: ['Montserrat'],
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FFF9F5',
          muted: '#EFE9E7'
        },
        primary: {
          DEFAULT: '#F68B1E',
          muted: '#FEE5CE'
        },
        secondary: {
          DEFAULT: '#ED1C25',
          muted: '#FCD1CF'
        },
        outline: {
          DEFAULT: '#656E95',
          variant: '#CDC9C9'
        },
        on: {
          surface: '#111F55',
          primary: '#FCF7E5'
        },
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'grid-dynamic': (value) => {
            return {
              gridTemplateColumns: `repeat(auto-fit, minmax(${value}, 1fr))`,
            }
          },
        },
        { values: theme('spacing') }
      )
    }),
  ],
}

