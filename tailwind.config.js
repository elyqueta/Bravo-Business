module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-dk": "var(--accent-dk)",
        "accent-lt": "var(--accent-lt)",
        danger: "var(--danger)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};
