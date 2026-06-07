import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF6F1",
        marshmallow: "#FBE9E7",
        rose: {
          50: "#FFF1F4",
          100: "#FFE2E9",
          200: "#FFC8D4",
          300: "#FFA3B8",
          400: "#FF7896",
          500: "#FF5577",
        },
        strawberry: "#FF4D6D",
        rosegold: "#B76E79",
        softpink: "#FFD1DC",
      },
      fontFamily: {
        rounded: [
          "Quicksand",
          "ui-rounded",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        hand: ["Caveat", "cursive"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(8deg)" },
        },
        sway: {
          "0%, 100%": { transform: "translateX(0) rotate(-3deg)" },
          "50%": { transform: "translateX(20px) rotate(3deg)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        shakeCute: {
          "0%, 100%": { transform: "translateX(0) rotate(0)" },
          "20%": { transform: "translateX(-3px) rotate(-2deg)" },
          "40%": { transform: "translateX(3px) rotate(2deg)" },
          "60%": { transform: "translateX(-2px) rotate(-1deg)" },
          "80%": { transform: "translateX(2px) rotate(1deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        sway: "sway 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        shakeCute: "shakeCute 0.6s ease-in-out infinite",
        sparkle: "sparkle 1.8s ease-in-out infinite",
      },
      boxShadow: {
        dreamy:
          "0 20px 60px -20px rgba(255, 119, 150, 0.45), 0 8px 30px -10px rgba(255, 180, 200, 0.55)",
        button:
          "0 10px 25px -10px rgba(255, 85, 119, 0.6), inset 0 -3px 0 rgba(0,0,0,0.08)",
        card: "0 25px 50px -12px rgba(255, 120, 150, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
