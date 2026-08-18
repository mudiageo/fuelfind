import { omniSvelte } from 'omni-svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [omniSvelte({
		auth: {
			enabled: true,
			emailAndPassword: { enabled: true, autoSignIn: true }
		},
		schema: {
			input: { patterns: ['src/**/*.schema.ts'] },
			output: {
				drizzle: { path: 'src/lib/db/server/schema.ts', format: 'single-file' },
				zod: { path: 'src/lib/db/validation', format: 'per-schema' },
				model: { path: 'src/lib/db/models', format: 'per-schema' }
			}
		}
	}), 
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	]
});
