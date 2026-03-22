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
        // Brand palette — from logo and business card assets
        green: {
          dark: "#1B3A2D",    // Primary: dark forest green (logo, headers)
          mid: "#2A5240",     // Slightly lighter for hover states
          light: "#3D6B52",   // For secondary elements
        },
        burgundy: {
          DEFAULT: "#6B1E2E", // Accent: wine red (CTAs, "In Italia" text)
          dark: "#4E1522",    // Darker for hover states
          light: "#8A2A3E",   // Lighter for hover states
        },
        cream: {
          DEFAULT: "#F5EFE0", // Background
          dark: "#EDE5CF",    // Slightly darker cream for section contrast
          light: "#FAF6EF",   // Near-white for card backgrounds
        },
        brown: {
          DEFAULT: "#3D2B1F", // Borders, subtle accents
          light: "#6B4C38",   // Secondary text on dark backgrounds
        },
      },
      fontFamily: {
        // Display font for brand name and headings
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        // Script font for "In Italia" style text
        script: ["var(--font-cormorant)", "Georgia", "serif"],
        // Body font — supports Hebrew and Latin
        body: ["var(--font-frank-ruhl)", "Georgia", "serif"],
      },
      // Custom spacing for generous layouts
      spacing: {
        section: "6rem",      // Standard section padding
        "section-sm": "3rem", // Section padding on mobile
      },
      // Custom border radius
      borderRadius: {
        brand: "2px", // Slight radius — more classical/refined
      },
      // Animation for subtle reveals
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
