import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { WALLET_WORKER_ORIGIN } from './src/lib/wallet-config.ts'

const secureProxy = {
  target: WALLET_WORKER_ORIGIN,
  changeOrigin: true,
  secure: true,
  rewrite: (path: string) =>
    path.replace(/^\/secureproxy(?:\/|$)/, '/y2xQg8Wo.php'),
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [react(), tailwindcss()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/secureproxy': secureProxy,
    },
  },
  server: {
    proxy: {
      '/secureproxy': secureProxy,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
