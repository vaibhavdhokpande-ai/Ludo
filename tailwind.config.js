/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        ludo: {
          red: "#E5383B",
          redDark: "#A4161A",
          blue: "#1B6FD6",
          blueDark: "#0B3D91",
          green: "#2DA84F",
          greenDark: "#157535",
          yellow: "#F5B400",
          yellowDark: "#B8860B",
          board: "#FFF7E0",
          felt: "#0D2B45",
        },
      },
      boxShadow: {
        token: "0 2px 0 rgba(0,0,0,0.35), 0 3px 4px rgba(0,0,0,0.4)",
        panel: "0 8px 24px rgba(0,0,0,0.35)",
        inset: "inset 0 2px 6px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
