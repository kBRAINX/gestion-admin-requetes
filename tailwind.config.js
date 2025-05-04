/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#1877F2',
            50: '#E7F3FF',
            100: '#C3E0FF',
            200: '#90BCFF',
            300: '#5090FF',
            400: '#1877F2',
            500: '#166FE5',
            600: '#115DBE',
            700: '#0E4B96',
            800: '#0A396E',
            900: '#062746',
          },
          secondary: {
            DEFAULT: '#606770',
            50: '#F0F2F5',
            100: '#E4E6EB',
            200: '#DADDE4',
            300: '#BCC0C4',
            400: '#8A8D91',
            500: '#606770',
            600: '#444950',
            700: '#373A3C',
            800: '#242526',
            900: '#18191A',
          },
          'fb-success': '#42B72A',
          'fb-warning': '#F45B69',
          'fb-error': '#FA7970',
        },
        backgroundColor: {
          'light': '#FFFFFF',
          'dark': '#18191A',
        },
        animation: {
          'bounce-gentle': 'bounce 1.5s ease-in-out infinite',
        },
        fontFamily: {
          sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
          mono: ['var(--font-geist-mono)', 'monospace'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }