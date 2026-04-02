import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: "#FFD952",
        pink: "#FF4D80",
        dark: "#1A0A00",
        cream: "#FFF8ED",
        green: "#B7E4C7",
        blue: "#FFE8F0",
        orange: "#FFE5D0",
      },
      fontFamily: {
        lilita: ["Lilita One", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      boxShadow: {
        'custom': "4px 4px 0 #1A0A00",
        'custom-hover': "6px 6px 0 #1A0A00",
        'custom-small': "2px 2px 0 #1A0A00",
        'custom-small-hover': "3px 3px 0 #1A0A00",
      },
      animation: {
        'fade-up': 'fadeUp 0.28s ease',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-slow': 'bounce 1.4s ease infinite',
        'dot': 'dot 1.4s ease infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        dot: {
          '0%, 80%, 100%': { opacity: '0' },
          '40%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
