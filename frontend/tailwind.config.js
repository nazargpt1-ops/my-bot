/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#50C878',
        accent: '#FFB347',
        success: '#50C878',
        warning: '#FFB347',
        error: '#FF6B6B',
        background: '#F8FAFB',
        surface: '#FFFFFF',
        text: '#2D3748',

        // Category colors
        'sport': '#FF6B6B',
        'health': '#48DBFB',
        'work': '#FFB347',
        'learning': '#50C878',
        'rest': '#DDA0DD',
        'personal': '#9B7EDE',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'coin-popup': 'coinPopup 1s ease-out',
        'progress-fill': 'progressFill 1.5s ease-in-out',
        'confetti': 'confetti 2s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        coinPopup: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-50px) scale(0.5)', opacity: '0' },
        },
        progressFill: {
          '0%': { strokeDashoffset: '553' },
          '100%': { strokeDashoffset: '138' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-300px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}