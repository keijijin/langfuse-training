import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--text-primary)",
            h1: { color: "var(--text-primary)", fontWeight: "800", fontSize: "2em", marginTop: "1.5em" },
            h2: { color: "var(--text-primary)", fontWeight: "700", fontSize: "1.5em", marginTop: "1.8em", paddingBottom: "0.3em", borderBottom: "1px solid var(--border)" },
            h3: { color: "var(--text-primary)", fontWeight: "600", fontSize: "1.25em", marginTop: "1.5em" },
            h4: { color: "var(--text-primary)", fontWeight: "600" },
            p: { marginTop: "1em", marginBottom: "1em", lineHeight: "1.8" },
            a: { color: "#2563eb", textDecoration: "underline", fontWeight: "500" },
            strong: { color: "var(--text-primary)", fontWeight: "600" },
            li: { marginTop: "0.3em", marginBottom: "0.3em" },
            "ul > li": { paddingLeft: "0.25em" },
            blockquote: {
              borderLeftColor: "#3b82f6",
              backgroundColor: "var(--bg-secondary)",
              padding: "0.75em 1em",
              borderRadius: "0 0.5rem 0.5rem 0",
              fontStyle: "normal",
              color: "var(--text-secondary)",
            },
            hr: { borderColor: "var(--border)" },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
