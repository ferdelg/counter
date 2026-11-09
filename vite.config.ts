import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Flinsh runs the app in a sandboxed iframe with a strict CSP (no network, no
// service workers), so `vite build --mode flinsh` emits one self-contained
// dist/index.html with no PWA and every asset inlined.
const stripFlinshUnsafeTags = (): Plugin => ({
	name: 'flinsh-strip-external-tags',
	enforce: 'post',
	transformIndexHtml: (html) =>
		html.replace(/\s*<link rel="(icon|manifest|apple-touch-icon)"[^>]*>/g, ''),
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const flinsh = mode === 'flinsh'
	return {
		plugins: [
			react(),
			flinsh
				? [
						viteSingleFile({ removeViteModuleLoader: true }),
						stripFlinshUnsafeTags(),
					]
				: VitePWA({
						registerType: 'autoUpdate',
						workbox: {
							globPatterns: ['**/*'],
							cleanupOutdatedCaches: false,
						},
						includeAssets: ['**/*'],
						manifest: {
							theme_color: '#ffffff',
							background_color: '#ffffff',
							display: 'standalone',
							scope: '/',
							start_url: '/index.html',
							short_name: 'Counter',
							description:
								'A basic counter app which ability to add new counters, update or delete them',
							name: 'Counter',
							icons: [
								{
									src: '/android-chrome-192x192.png',
									sizes: '192x192',
									type: 'image/png',
								},
								{
									src: '/android-chrome-512x512.png',
									sizes: '512x512',
									type: 'image/png',
								},
								{
									src: '/maskable_icon.png',
									sizes: '192x192',
									type: 'image/png',
									purpose: 'any maskable',
								},
							],
						},
					}),
		],
		// Static files in public/ (icons, PWA manifest) aren't needed in the
		// single-file build.
		publicDir: flinsh ? false : 'public',
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	}
})
