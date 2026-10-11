import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * 京华·仕途 V1.2 极简版。
 *
 * 纯静态前端:没有后端、不需要数据库,存档放在浏览器本地。
 * 因此同一份构建既可以本机打开,也可以直接部署到免费静态托管,
 * 手机和电脑浏览器都能正常运行。
 */
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5273 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
  },
});
