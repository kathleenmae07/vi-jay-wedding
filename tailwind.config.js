export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: '#5C1A2E',
        'burgundy-light': '#8B2A45',
        rust: '#B85A1A',
        'rust-light': '#D4763A',
        blush: '#E8A89C',
        'blush-light': '#F2C9C2',
        olive: '#6B7A3A',
        cream: '#FDF6F0',
        'warm-white': '#FFFAF6',
        'text-dark': '#2C1810',
        'text-mid': '#6B4A3A',
        'text-light': '#A07060',
      },
      boxShadow: {
        soft: '0 24px 60px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(93, 32, 60, 0.16) 0%, rgba(92, 26, 46, 0.92) 82%)',
      },
      fontFamily: {
        display: ['"Pinyon Script"', 'cursive'],
        serif: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
