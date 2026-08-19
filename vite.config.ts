import { omniSvelte } from 'omni-svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		omniSvelte({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }: any) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			auth: {
				enabled: true,
				emailAndPassword: { enabled: true, autoSignIn: true }
			},
			schema: {
				input: { patterns: ['src/lib/schema.ts'] },
				output: {
					drizzle: { path: 'src/lib/db/server/schema.ts', format: 'single-file' },
					zod: { path: 'src/lib/db/validation', format: 'per-schema' },
					model: { path: 'src/lib/db/models', format: 'per-schema' }
				}
			},
			kit: {
				adapter: adapter()
			}
		}),
		tailwindcss()
	]
});
