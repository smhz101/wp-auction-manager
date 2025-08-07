import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
	const isProd = mode === 'production';

	return {
		plugins: [react()],
		define: {
			__DEV__: !isProd,
			__VERSION__: JSON.stringify('1.0.0'), // Optional: for build versioning
		},
		resolve: {
			alias: {
				'@': resolve(__dirname, 'src'),
			},
		},
		css: {
			postcss: resolve(__dirname, './postcss.config.js'), // Tailwind + Autoprefixer
		},
		build: {
			target: 'es2019', // Better browser compatibility for WP
			minify: isProd ? 'esbuild' : false,
			sourcemap: true,
			outDir: resolve(__dirname, '../assets/admin'),
			emptyOutDir: false,
			rollupOptions: {
				external: ['jquery'],
				input: {
					admin: resolve(__dirname, 'src/wp-admin-entry.jsx'),
				},
				output: {
					globals: {
						jquery: 'jQuery',
					},
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
	};
});
