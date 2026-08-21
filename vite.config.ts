import { omniSvelte } from 'omni-svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { defineConfig } from 'vite';

const adapter = process.env.WORKER_CI ? adapterCloudflare : adapterAuto;

export default defineConfig({
	plugins: [
		omniSvelte({
			compilerOptions: {
				runes: ({ filename }: any) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			database: {
				enabled: true,
				connection: { url: process.env.DATABASE_URL },
				schema: null
			},
			schema: {
				mode: 'files',
				parsing: { strategy: 'ast' },
				input: {
					patterns: ['src/**/*.schema.ts', 'src/lib/schema.ts'],
					exclude: ['**/node_modules/**', '**/*.test.ts']
				},
				output: {
					directory: './src/lib/generated',
					drizzle: {
						path: './src/lib/db/server/schema.ts',
						format: 'single-file'
					},
					zod: {
						path: './src/lib/db/validation',
						format: 'per-schema'
					},
					model: {
						path: './src/lib/db/models',
						format: 'per-schema',
						includeTypes: true,
						includeCrud: true
					}
				},
				dev: {
					watch: true,
					hotReload: true,
					generateOnStart: true,
					logLevel: 'info'
				}
			},
			auth: {
				enabled: true,
				sync: true,
				executionMode: 'import',
				appName: 'FuelFind',
				baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
				basePath: '/api/auth',
				secret: process.env.BETTER_AUTH_SECRET,
				emailAndPassword: {
					enabled: true,
					requireEmailVerification: false,
					autoSignIn: true,
					minPasswordLength: 8
				},
				session: {
					expiresIn: 60 * 60 * 24 * 7,
					updateAge: 60 * 60 * 24
				},
				migrations: {
					autoMigrate: false,
					strategy: 'push'
				},
				plugins: {
					username: true,
					magicLink: true,
					twoFactor: true
				}
			},
			kit: {
				adapter: adapter(),
				alias: {
					'$lib': 'src/lib'
				}
			}
		}),
		tailwindcss()
	]
});
