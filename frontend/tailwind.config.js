export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#e94560', dark:'#c73652', light:'#ff6b88' },
        dark: { DEFAULT:'#1a1a2e', secondary:'#16213e', card:'#0f3460', lighter:'#1e2a45' },
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
      animation: { 'fade-in':'fadeIn 0.3s ease-out', 'slide-up':'slideUp 0.4s ease-out', shimmer:'shimmer 1.5s infinite' },
      keyframes: {
        fadeIn: { from:{opacity:0}, to:{opacity:1} },
        slideUp: { from:{opacity:0,transform:'translateY(20px)'}, to:{opacity:1,transform:'translateY(0)'} },
        shimmer: { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
      },
      boxShadow: { card:'0 4px 20px rgba(0,0,0,0.3)', glow:'0 0 20px rgba(233,69,96,0.4)', 'glow-sm':'0 0 10px rgba(233,69,96,0.3)' },
    },
  },
  plugins: [],
};
