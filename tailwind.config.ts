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
        ink: "#1a1a2e",
        paper: "#fafaf8",
        accent: "#ff6534",
        sunshine: "#ffd166",
        coral: "#ef767a",
        teal: "#06d6a0",
        violet: "#9b5de5",
        sky: "#4cc9f0"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
