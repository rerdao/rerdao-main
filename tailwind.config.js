/** @type {import('tailwindcss').Config} */
const daisyui = require('daisyui/src/theming/themes')

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'swap-light': "url('/swap-bg-light.png')",
        'swap-dark': "url('/swap-bg-dark.png')",
        'panel-light': "url('/panel-light.jpg')",
        'panel-dark': "url('/panel-dark.jpg')",
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyui['light'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#000000',

          accent: '#63E0B3',
        },
      },
      {
        dark: {
          ...daisyui['dark'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#ffffff',

          'base-100': '#212C4C',
          'base-200': '#394360',
          'base-300': '#42517a',
          'base-content': '#eaeaea',

          accent: '#63E0B3',
        },
      },
    ],
  },
}
