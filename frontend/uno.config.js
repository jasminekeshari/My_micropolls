import { defineConfig, presetUno, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetWind(),
  ],
  theme: {
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      }
    }
  },
  shortcuts: {
    'glass': 'bg-white/10 backdrop-blur-xl border border-white/20',
    'glass-dark': 'bg-black/20 backdrop-blur-xl border border-white/10',
    'btn-primary': 'px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300',
    'card-hover': 'hover:scale-105 hover:shadow-2xl transition-all duration-300',
  },
  rules: [
    ['animate-blob', {
      animation: 'blob 7s infinite'
    }],
    ['animate-float', {
      animation: 'float 6s ease-in-out infinite'
    }],
    ['animate-slideIn', {
      animation: 'slideIn 0.5s ease-out'
    }],
    ['animate-fadeInUp', {
      animation: 'fadeInUp 0.6s ease-out'
    }],
    ['animation-delay-1000', {
      'animation-delay': '1s'
    }],
    ['animation-delay-2000', {
      'animation-delay': '2s'
    }],
    ['animation-delay-4000', {
      'animation-delay': '4s'
    }],
    ['animation-delay-6000', {
      'animation-delay': '6s'
    }],
    ['animation-delay-150', {
      'animation-delay': '150ms'
    }],
    ['animation-delay-200', {
      'animation-delay': '200ms'
    }],
  ]
})