import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    manifest: true,
    sourcemap: true,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'vendor-react': ['react', 'react-dom'],
    //       'vendor-rhf-zod': ['react-hook-form', '@hookform/resolvers', 'zod'],
    //       'vendor-shadcn': [
    //         '@radix-ui/react-dialog',
    //         '@radix-ui/react-scroll-area',
    //         '@radix-ui/react-select',
    //       ],
    //     },
    //   },
    // },
  },
})
