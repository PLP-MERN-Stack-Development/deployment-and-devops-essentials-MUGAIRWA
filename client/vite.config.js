import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog'],
          clerk: ['@clerk/clerk-react'],
          socket: ['socket.io-client'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
  },
})
