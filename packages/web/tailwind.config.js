/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wood: { DEFAULT: "#3b2d21", deep: "#2a2018", light: "#5a4632", line: "#6d5741" },
        paper: { DEFAULT: "#f6f2e9", dim: "#ece5d7", card: "#fffdf8", edge: "#d8cfbc" },
        slate2: { DEFAULT: "#46596b", light: "#6b7f92", pale: "#dde4ea" },
        seal: { DEFAULT: "#8c2f2a", light: "#a8433c", pale: "#f0dcd9" },
        ink: { DEFAULT: "#23201c", soft: "#4a453c", mute: "#7d7668" },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        num: ['"Cascadia Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: { DEFAULT: "3px" },
    },
  },
  plugins: [],
};
