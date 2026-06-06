import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: "#fff0f6",
          100: "#ffd6e7",
          200: "#ffadd2",
          300: "#ff85c2",
          400: "#f759ab",
          500: "#eb2f96",
          pastel: "#FFB3D1",
          light: "#FFD6E7",
          soft: "#FFF0F6",
        },
        yellow: {
          pastel: "#FFF3B0",
          light: "#FFF7CC",
          soft: "#FFFBE8",
          accent: "#FFD166",
        },
        blue: {
          pastel: "#B3D4FF",
          light: "#D6E8FF",
          soft: "#EBF4FF",
          accent: "#4DA6FF",
        },
        brand: {
          pink: "#FF6BAD",
          navy: "#1A1F5E",
          accent: "#FFB3D1",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(255, 107, 173, 0.08)",
        card: "0 2px 16px rgba(0, 0, 0, 0.06)",
        pink: "0 8px 32px rgba(255, 107, 173, 0.2)",
        glow: "0 0 40px rgba(255, 179, 209, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
