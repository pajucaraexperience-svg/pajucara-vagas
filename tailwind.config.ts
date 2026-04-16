import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        teal: {
          DEFAULT: "#1B7FA6",
          dark: "#0F5E7D",
          light: "#4DA8C9",
          50: "#EBF6FB",
          100: "#C8E9F5",
          200: "#94D3EB",
          300: "#60BDE1",
          400: "#4DA8C9",
          500: "#1B7FA6",
          600: "#0F5E7D",
          700: "#0A4560",
          800: "#072D3E",
          900: "#03151D",
        },
        sand: {
          DEFAULT: "#C4A882",
          light: "#E8D5B7",
          dark: "#8B7355",
          50: "#FAF6F0",
          100: "#F2EAD9",
          200: "#E8D5B7",
          300: "#D9BC94",
          400: "#C4A882",
          500: "#AD8E65",
          600: "#8B7355",
          700: "#6B5840",
          800: "#4A3D2C",
          900: "#2A2217",
        },
        cream: {
          DEFAULT: "#F8F5F0",
          dark: "#EDE8E0",
          50: "#FDFCFA",
          100: "#F8F5F0",
          200: "#EDE8E0",
          300: "#DDD5C9",
          400: "#C9BFB0",
          500: "#B5A898",
        },
        gold: {
          DEFAULT: "#C4962A",
          light: "#D4A93A",
          dark: "#A07A1E",
          50: "#FDF8EC",
          100: "#F9EDCB",
          200: "#F0D487",
          300: "#E6BB44",
          400: "#D4A93A",
          500: "#C4962A",
          600: "#A07A1E",
          700: "#7C5E16",
          800: "#58420F",
          900: "#342707",
        },
        dark: "#1A1A1A",

        // Tokens semânticos (mantidos para componentes shadcn)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        elegant: "0 4px 24px rgba(27, 127, 166, 0.08), 0 1px 4px rgba(0,0,0,0.04)",
        card: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px rgba(27, 127, 166, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
        gold: "0 4px 24px rgba(196, 150, 42, 0.15)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(160deg, #0F5E7D 0%, #1B7FA6 40%, #2D8FAF 60%, #C4A882 100%)",
        "gradient-cream":
          "linear-gradient(180deg, #F8F5F0 0%, #EDE8E0 100%)",
        "gradient-signature":
          "linear-gradient(135deg, #C4962A 0%, #D4A93A 50%, #C4A882 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
