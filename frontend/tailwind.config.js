export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        ink:     "#0f172a",
        slate:   "#475569",
        accent:  "#1a56db",
        surface: "#F8FAFC",
        border:  "#CBD5E1",
      },
    },
  },
  plugins: [],
}
