import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-ui': ['motion/react', 'lucide-react'],
          'vendor-core': ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
        }
      }
    }
  }
})
