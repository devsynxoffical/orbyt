import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbyt: {
          yellow: "#FACC15",
          "yellow-hover": "#EAB308",
          "yellow-soft": "#FEF08A",
          "yellow-bg": "#FEE871",
          "yellow-light": "#FEFCE8",
          dark: "#111827",
          midnight: "#181826",
          charcoal: "#1F2937",
          cream: "#FFFBEB",
          lilac: "#EDE9FE",
          peach: "#FFEDD5",
          ice: "#F0F9FF",
          mint: "#DCFCE7",
        },
        collab: {
          yellow: "#FACC15",
          "yellow-hover": "#EAB308",
          "yellow-light": "#FEF9C3",
          "yellow-soft": "#FEFCE8",
          dark: "#111827",
          gray: "#F4F4F5",
          charcoal: "#1F2937",
        },
        brand: {
          primary: "#FACC15",
          secondary: "#EAB308",
          container: "#FEF08A",
          "container-secondary": "#FEF9C3",
          dark: "#111827",
        },
        primary: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          200: "#FEF08A",
          300: "#FDE047",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
          700: "#A16207",
          800: "#854D0E",
          900: "#713F12",
        },
        accent: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        warning: {
          500: "#F59E0B",
        },
        danger: {
          500: "#EF4444",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },
        surface: {
          DEFAULT: "#FAFAFA",
          dark: "#181826",
          glass: "rgba(255, 255, 255, 0.8)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(250, 204, 21, 0.4)",
        "glow-sm": "0 8px 32px 0 rgba(250, 204, 21, 0.15)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        "card-hover": "0 14px 34px -4px rgba(15, 23, 42, 0.1)",
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.04)",
      },
      backgroundImage: {
        "mesh-hero":
          "radial-gradient(at 0% 0%, rgba(250,204,21,0.2) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(254,240,138,0.3) 0px, transparent 50%)",
        "mesh-dashboard":
          "radial-gradient(at 0% 0%, rgba(250,204,21,0.06) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244,244,245,0.8) 0px, transparent 50%)",
        "grid-pattern":
          "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
        "grid-pattern-dark":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "gradient-brand": "linear-gradient(135deg, #FDE047 0%, #FACC15 100%)",
        "gradient-cta": "linear-gradient(90deg, #FACC15 0%, #EAB308 100%)",
        "gradient-dark": "linear-gradient(180deg, #181826 0%, #0F172A 100%)",
        "gradient-primary-btn": "linear-gradient(90deg, #18181B 0%, #09090B 100%)",
        "gradient-collab-yellow": "linear-gradient(180deg, #FACC15 0%, #EAB308 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 35s linear infinite",
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
