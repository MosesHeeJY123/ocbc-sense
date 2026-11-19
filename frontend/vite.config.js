import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // listen on the network too, so a phone on the same Wi-Fi can open the app
  server: { host: true },
  preview: { host: true },
})
