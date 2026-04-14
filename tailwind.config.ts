import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-cta":
          "linear-gradient(135deg, rgb(252,64,83), rgb(252,44,65), rgb(184,20,37))",
        "gradient-card":
          "linear-gradient(135deg, rgb(var(--grad-card-from) / 0.7), rgb(var(--grad-card-to) / 0.4))",
        "gradient-hero":
          "linear-gradient(to top, hsl(var(--background)), rgba(7,9,7,0.4), transparent)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(242, 24, 40, 0.15)",
        "glow-lg": "0 8px 32px rgba(252, 44, 65, 0.4)",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)",
            opacity: "0.8",
          },
          "25%": {
            transform: "translateY(-30px) translateX(10px)",
            opacity: "1",
          },
          "50%": {
            transform: "translateY(-15px) translateX(-15px)",
            opacity: "0.6",
          },
          "75%": {
            transform: "translateY(-40px) translateX(5px)",
            opacity: "0.9",
          },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(242, 24, 40, 0.3)" },
          "50%": { boxShadow: "0 0 28px rgba(242, 24, 40, 0.7)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 15s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-down": "fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        breathe: "breathe 5s ease-in-out infinite",
        "text-shimmer": "text-shimmer 4s ease-in-out infinite",
        "spin-slow": "spin-slow 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
