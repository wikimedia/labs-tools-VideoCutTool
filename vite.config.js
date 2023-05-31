import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	server: {
		port: 3000,
		host: true,
		strictPort: true,
		hmr: {
			clientPort: 3000
		}
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			input: 'index.html'
		}
	},
	base: './',
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/tests/setup.js',
		css: true
	},
	plugins: [react()]
});
