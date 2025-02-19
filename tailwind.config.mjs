/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary))",
          dark: "rgb(var(--primary-dark))",
          light: "rgb(var(--primary-light))",
        },
        background: {
          DEFAULT: "rgb(var(--background))",
          dark: "rgb(var(--background-dark))",
          light: "rgb(var(--background-light))",
        },
        foreground: "var(--foreground)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        pulse: "pulse 2s infinite",
        gradient: "gradient 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideUp: {
          "0%": {
            transform: "translateY(100%)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        gradient: {
          "0%": {
            backgroundPosition: "0% center",
          },
          "100%": {
            backgroundPosition: "-200% center",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        250: "250ms",
        2000: "2000ms",
      },
      transitionProperty: {
        all: "all",
      },
      scale: {
        102: "1.02",
        98: "0.98",
      },
      fontFamily: {
        mono: ["Consolas", "Monaco", "monospace"],
        sans: [
          "Inter var",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderOpacity: {
        15: "0.15",
      },
      backgroundOpacity: {
        15: "0.15",
      },
    },
  },
  plugins: [],
};
