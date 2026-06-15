import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f6ff",
          100: "#ebedff",
          500: "#5666ff",
          700: "#3546ef",
          900: "#1f2aa5"
        },
        clinic: {
          teal:       "#046e78",
          "teal-mid": "#0c7882",
          "teal-dark":"#09666f",
          "teal-light":"#0d3540",
          "teal-pale": "#1a4550",
          "text-dark": "#e8ddd0",
          "dark-bg":   "#0d1e20",
          "dark-card": "#162728",
        },
      }
    },
  },
  plugins: [],
};

export default config;
