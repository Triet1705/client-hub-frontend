import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--background)",
        foreground: "var(--foreground)",

        // --- Client Hub Brand Colors ---
        primary: {
          DEFAULT: "#10b77f", // Emerald Green (Main Brand)
          dark: "#059669",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0ea5e9", // Cyber Blue (Accents)
          foreground: "#ffffff",
        },
        critical: {
          DEFAULT: "#E11D48", // Rose (Alerts)
        },
        amber: {
          DEFAULT: "#f59e0b", // Warnings
        },

        "background-dark": "#0f172a", // Deep Slate Base
        "surface-dark": "#1e293b", // Card Background
        "surface-highlight": "#334155",
        "border-dark": "#334155",
        "pitch-black": "#020617", // Sidebar/Modals
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
