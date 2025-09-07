/** Tailwind v4 config (minimal) */
export default {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@kit/design-system/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-inter), ui-sans-serif, system-ui",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
      },
    },
  },
};
