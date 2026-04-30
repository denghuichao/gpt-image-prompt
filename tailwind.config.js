/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"Cormorant Garamond"', "Georgia", "serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Sora"', "system-ui", "sans-serif"],
        mono: ['"Fira Code"', "Menlo", "monospace"],
      },
      colors: {
        night: {
          50:  "#f2f0ff",
          100: "#e5e1ff",
          200: "#ccc5f5",
          300: "#a89fc8",
          400: "#8b84a8",
          500: "#6e6888",
          600: "#514c6e",
          700: "#3a3654",
          800: "#27233e",
          900: "#1c1930",
          950: "#120f1e",
        },
        glow: {
          100: "#fef9e7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          900: "#1c1205",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.18)",
        "glow-sm": "0 0 16px rgba(251,191,36,0.15)",
        "glow-md": "0 0 32px rgba(251,191,36,0.2)",
        "inner-glow": "inset 0 0 0 1px rgba(251,191,36,0.15)",
      },
      screens: {
        narrow: { raw: "(max-aspect-ratio: 3 / 2)" },
        wide: { raw: "(min-aspect-ratio: 3 / 2)" },
        "taller-than-854": { raw: "(min-height: 854px)" },
      },
    },
  },
  plugins: [],
};
