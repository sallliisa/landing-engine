/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Sora'],
      title: ['Dosis']
    },
    extend: {
      colors: {
        muted: {
          DEFAULT: '#707070'
        },
        primary: {
          DEFAULT: '#14524B',
          cta: '#4C837D',
          variant: '#4C837D'
        },
        secondary: {
          DEFAULT: '#165780'
        },
        surface: {
          DEFAULT: '#E3EAE9',
          container: {
            low: '#f3f3f3',
            DEFAULT: '#DBE4E3',
            high: '#D3DEDD'
          },
        },
        on: {
          primary: {
            DEFAULT: '#CFD3D7',
            cta: '#FFFFFF'
          }
        }
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

