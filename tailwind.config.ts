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
      keyframes: {
        "dialog-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": { "50%": { opacity: "0.5" } },
      },
      animation: {
        "dialog-in": "dialog-in 150ms ease-out",
        "toast-in": "toast-in 200ms ease-out",
        pulse: "pulse-soft 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      maxWidth: { content: "1120px", admin: "1280px" },
    },
  },
} satisfies Config;
