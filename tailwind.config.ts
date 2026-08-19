import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Primary CTA orange (SCAN-style warm accent)
        brand: {
          50: "#fff5ed", 100: "#ffe8d4", 200: "#ffcda8", 300: "#ffab70",
          400: "#ff7d36", 500: "#f97316", 600: "#ea5c07", 700: "#c2450b",
          800: "#9a3811", 900: "#7c3111"
        },
        // Deep charcoal/navy for header & text
        ink: {
          50: "#f5f6f8", 100: "#e7e9ee", 200: "#c9cdd8", 300: "#9aa2b4",
          400: "#697088", 500: "#4a5169", 600: "#363c52", 700: "#282d3f",
          800: "#1c2030", 900: "#12151f"
        },
        sale: { 500: "#e11d48", 600: "#be123c" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        hover: "0 10px 30px rgba(16,24,40,.12)"
      }
    }
  },
  plugins: []
};
export default config;
