import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-redux'],
          'recharts-vendor': ['recharts'],
          'firebase-vendor': ['firebase/app', 'firebase/analytics'],
          'framer-vendor': ['framer-motion'],
          'dayjs-vendor': ['dayjs'],
        },
      },
    },
  },
})
