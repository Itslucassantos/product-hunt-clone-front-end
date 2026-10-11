import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: { DEFAULT: "var(--ink)", soft: "var(--ink-soft)" },
        muted: "var(--muted)",
        border: { DEFAULT: "var(--border)", strong: "var(--border-strong)" },
        tag: "var(--tag)",
        primary: { DEFAULT: "var(--primary)", text: "var(--primary-text)" },
        dashed: "var(--dashed)",
        danger: "var(--danger)",
        "danger-solid": "#B42318",
        star: { DEFAULT: "#E8A317", empty: "var(--star-empty)" },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
      maxWidth: { content: "1120px", admin: "1280px" },
    },
  },
} satisfies Config;
