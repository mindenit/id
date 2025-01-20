import { asFunction, type NameAndRegistrationPair, Lifetime } from 'awilix'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema.js'

import { CommonDependencies, ExternalDependencies } from '@/core/types/index.js'
import { getConfig } from './config.js'
import { SINGLETON_CONFIG } from '@/core/constants/index.js'
import { Redis } from 'ioredis'
import { Throttler } from '@/core/services/Throttler.js'
import { RefillingTokenBucket } from '@/core/services/RefillingTokenBucket.js'

export const resolveCommonDiConfig = (
	dependencies: ExternalDependencies,
): NameAndRegistrationPair<CommonDependencies> => ({
	db: asFunction(
		({ config }: CommonDependencies) => {
			const { user, password, host, port, database } = config.db

			const queryClient = postgres({
				username: user,
				password,
				host,
				port,
				database,
			})

			return {
				client: drizzle(queryClient, {
					schema,
					logger: true,
					casing: 'snake_case',
				}),
				connection: queryClient,
			}
		},
		{
			dispose: ({ connection }) => {
				connection.end()
			},
			lifetime: Lifetime.SINGLETON,
		},
	),
	redis: asFunction(
		({ config }: CommonDependencies) => {
			const redis = new Redis(config.redis.url)

			return redis
		},
		{
			dispose: (redis) => {
				return new Promise((resolve) => {
					void redis.quit((_err, result) => {
						return resolve(result)
					})
				})
			},
			lifetime: Lifetime.SINGLETON,
		},
	),
	logger: asFunction(() => {
		return dependencies.app.log
	}, SINGLETON_CONFIG),
	throttler: asFunction(({ redis }: CommonDependencies) => {
		const timeoutSeconds = [1, 2, 4, 8, 16, 30, 60, 180, 300]

		return new Throttler({ timeoutSeconds, redis })
	}, SINGLETON_CONFIG),
	ipBucket: asFunction(({ redis }: CommonDependencies) => {
		return new RefillingTokenBucket({
			max: 20,
			refillIntervalSeconds: 1,
			redis,
		})
	}, SINGLETON_CONFIG),
	globalBucket: asFunction(({ redis }: CommonDependencies) => {
		return new RefillingTokenBucket({
			max: 20,
			refillIntervalSeconds: 1,
			redis,
		})
	}, SINGLETON_CONFIG),
	config: asFunction(() => {
		return getConfig()
	}, SINGLETON_CONFIG),
})
