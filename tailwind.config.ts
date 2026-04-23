import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        display: ["'TypoRound'", "'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        "round-bold": ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
      },
      colors: {
        "brand-neon": "#04FF8D",
        "brand-magenta": "#FF00FF",
        "brand-purple": "#7B2CBF",
        "brand-cyan": "#00D2FF",
        "brand-orange": "#FF4D4D",
        "brand-black": "#000000",
        "brand-white": "#FFFFFF",
        /* Multicolor Neon Palette - solo para gráficos/ilustraciones */
        "neon-magenta": "#FF00FF",
        "neon-blue": "#0066FF",
        "neon-orange": "#FF6600",
        "neon-cyan": "#00E5FF",
        "neon-purple": "#9D00FF",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
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
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-neon-multi': 'linear-gradient(135deg, #FF00FF, #0066FF, #04FF8D, #FF6600)',
        'gradient-prisma': 'linear-gradient(135deg, #9D00FF, #0066FF, #00E5FF, #04FF8D)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'large': 'var(--shadow-large)',
        'glow': 'var(--shadow-glow)',
        'glow-neon': '0 0 30px rgba(4, 255, 141, 0.4), 0 0 60px rgba(4, 255, 141, 0.1)',
        'glow-multi': '0 0 20px rgba(255, 0, 255, 0.2), 0 0 40px rgba(0, 102, 255, 0.15), 0 0 60px rgba(4, 255, 141, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in": {
          from: {
            transform: "translateX(-100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
