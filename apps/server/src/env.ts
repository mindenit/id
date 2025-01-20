import { z } from 'zod'

const envSchema = z.object({
	POSTGRES_HOST: z.string(),
	POSTGRES_DB: z.string(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_PORT: z.coerce.number().default(5432),
	REDIS_URL: z.string(),
	REDIS_PASSWORD: z.string(),
	COOKIE_SECRET: z.string(),
})

const env = envSchema.parse(process.env)

export { env }
