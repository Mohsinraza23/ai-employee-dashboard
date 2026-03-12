import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366F1",
          dark:    "#4F46E5",
          light:   "#818CF8",
          purple:  "#A855F7",
          cyan:    "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "app":          "linear-gradient(135deg, #020617 0%, #0f172a 40%, #000000 100%)",
        "brand-gradient": "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      boxShadow: {
        "glow-sm":  "0 0 15px rgba(99,102,241,0.2)",
        "glow":     "0 0 30px rgba(99,102,241,0.3)",
        "glow-lg":  "0 0 60px rgba(99,102,241,0.25), 0 20px 40px rgba(0,0,0,0.5)",
        "card":     "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
        "modal":    "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 400ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 300ms ease both",
      },
    },
  },
  plugins: [],
};

export default config;
