import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif Pro"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#1a1a1a",
        paper: "#fdfbf7",
        accent: "#8b5a3c"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
