module.exports = {
  darkMode: "class",
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      colors: {
        link: "#0074de",
      },
      keyframes: {
        wave: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(21deg)" },
          "20%": { transform: "rotate(-21deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-14deg)" },
          "50%": { transform: "rotate(7deg)" },
          "60%": { transform: "rotate(-7deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        wave: "wave 2.5s 3",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
