/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#7C3AED",
        success: "#10B981",
        danger: "#EF4444",
        lightbg: "#F8FAFC",
        darkbg: "#0F172A",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(31, 38, 135, 0.18)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};
