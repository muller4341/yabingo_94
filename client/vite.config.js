import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      
      '/api': {
        // target: 'http://localhost:3000',
        target: 'http://127.0.0.1:3000', // Changed from localhost to explicit IPv4
        secure: false,
        changeOrigin: true,
      },
    },
    '/results': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    
  },
  plugins: [react()],
});