import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.VITE_BASE || "/~lochis1/SAE401/frontend/dist/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  preview: {
   port: 5173,
   strictPort: true,
  },
  server: {
   port: 5173,
   strictPort: true,
   host: true,
   origin: "http://localhost:8090",
   allowedHosts: ["sae-frontend"]
  },
});