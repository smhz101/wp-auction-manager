import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, '../assets/admin'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'src/wp-admin-entry.jsx'),
      },
      output: {
        entryFileNames: 'js/admin-app.js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'css/admin-app.css';
          }
          return 'js/[name][extname]';
        },
      },
    },
  },
});
