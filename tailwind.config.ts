import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Royal blue – primary brand
        royal: {
          50: "#f0f4ff",
          100: "#dde6ff",
          200: "#c3d1ff",
          300: "#9db2ff",
          400: "#7089fc",
          500: "#4d64f8",
          600: "#2940ed",
          700: "#1e2fd6",
          800: "#1c28ad",
          900: "#1e2888",
          950: "#141a5c",
        },
        // Ivory / warm white – backgrounds
        ivory: {
          50: "#faf8f4",
          100: "#f4f0e8",
          200: "#e8dfd0",
          300: "#d8c9b0",
          400: "#c5ae8c",
          500: "#b0946e",
          600: "#9a7a56",
          700: "#806246",
          800: "#69503c",
          900: "#574335",
          950: "#2e221a",
        },
        // Muted gold accents
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Terracotta highlights
        terracotta: {
          50: "#fdf4f1",
          100: "#fbe6df",
          200: "#f7cfc4",
          300: "#f1ad9c",
          400: "#e87d67",
          500: "#db5840",
          600: "#c83e27",
          700: "#a7321d",
          800: "#8a2d1e",
          900: "#732b1e",
        },
        // Sandstone
        sandstone: {
          50: "#faf8f5",
          100: "#f2ede5",
          200: "#e5dbcc",
          300: "#d3c2a8",
          400: "#bda380",
          500: "#ac8a64",
          600: "#9f7858",
          700: "#85624a",
          800: "#6d5040",
          900: "#594238",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.3" }],
      },
      boxShadow: {
        "premium": "0 4px 24px -4px rgba(20, 26, 92, 0.1), 0 2px 8px -2px rgba(20, 26, 92, 0.06)",
        "premium-lg": "0 12px 48px -8px rgba(20, 26, 92, 0.15), 0 4px 16px -4px rgba(20, 26, 92, 0.08)",
        "gold": "0 4px 24px -4px rgba(245, 158, 11, 0.25)",
        "card": "0 1px 4px rgba(20, 26, 92, 0.08), 0 4px 16px rgba(20, 26, 92, 0.04)",
      },
      backgroundImage: {
        "royal-gradient": "linear-gradient(135deg, #141a5c 0%, #1e2888 50%, #2940ed 100%)",
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "hero-overlay": "linear-gradient(to bottom, rgba(20, 26, 92, 0.7) 0%, rgba(20, 26, 92, 0.4) 50%, rgba(20, 26, 92, 0.8) 100%)",
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "shimmer": "shimmer 1.5s infinite",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

