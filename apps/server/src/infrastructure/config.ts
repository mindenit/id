import {
	AuthConfig,
	Config,
	DbConfig,
	RedisConfig,
} from '@/core/types/index.js'
import { env } from '@/env.js'

const getRedisConfig = (): RedisConfig => ({
	url: env.REDIS_URL,
})

const getDbConfig = (): DbConfig => ({
	user: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	host: env.POSTGRES_HOST,
	port: env.POSTGRES_PORT,
	database: env.POSTGRES_DB,
})

const getAuthConfig = (): AuthConfig => ({
	cookieSecret: env.COOKIE_SECRET,
})

const getConfig = (): Config => ({
	db: getDbConfig(),
	auth: getAuthConfig(),
	redis: getRedisConfig(),
})

export { getConfig }
