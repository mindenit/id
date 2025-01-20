import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema:
		process.env.NODE_ENV! === 'production'
			? './dist/db/schema.js'
			: './src/db/schema.ts',
	out: './src/db/migrations',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		port: 5432,
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		database: process.env.POSTGRES_DB!,
		ssl: false,
	},
})
