import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  base: "/",
  resolve: {
    alias: {
      "@/components": "/src/components",
      "@/hooks": "/src/hooks",
      "@/utils": "/src/utils",
      "@/service": "/src/service",
      "@/pages": "/src/pages",
      "@/context": "/src/context",
    },
  },
  server: {
    host: '0.0.0.0'  },
});
