/** Tailwind config to ensure content scanning & dark mode class usage */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 6px 24px rgba(2,6,23,.06), 0 2px 8px rgba(2,6,23,.04)",
        focus:
          "0 0 0 2px rgba(var(--bg),1), 0 0 0 4px rgba(var(--ring),.7), 0 0 0 6px rgba(var(--ring),.18)",
      },
    },
  },
  plugins: [],
};
