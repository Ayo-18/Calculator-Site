import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /Calculator-Site/, but keep local
  // dev at the site root so `npm run dev` still opens as before.
  base: command === "build" ? "/Calculator-Site/" : "/",
  plugins: [react()],
  server: {
    port: 3456,
    open: true,
  },
}));
