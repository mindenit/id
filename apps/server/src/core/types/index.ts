/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema.js'
import type { FastifyBaseLogger, FastifyInstance, RouteOptions } from 'fastify'
import type http from 'node:http'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { Sql } from 'postgres'
import type { Redis } from 'ioredis'
import { Resolver } from 'awilix'
import { IRefillingTokenBucket, IThrottler } from './services.js'

type AppInstance = FastifyInstance<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse
>

type DatabaseClient = PostgresJsDatabase<typeof schema>

type Route = RouteOptions<
	http.Server,
	http.IncomingMessage,
	http.ServerResponse,
	any,
	any,
	any,
	ZodTypeProvider
>

interface AuthConfig {
	cookieSecret: string
}

interface DbConfig {
	user: string
	password: string
	host: string
	port: number
	database: string
}

interface RedisConfig {
	url: string
}

interface Config {
	auth: AuthConfig
	db: DbConfig
	redis: RedisConfig
}

interface Routes {
	routes: Route[]
}

interface ExternalDependencies {
	app: AppInstance
}

interface CommonDependencies {
	config: Config
	db: {
		connection: Sql
		client: DatabaseClient
	}
	redis: Redis
	logger: FastifyBaseLogger
	throttler: IThrottler
	ipBucket: IRefillingTokenBucket
	globalBucket: IRefillingTokenBucket
}

type BaseDiConfig<T> = Record<keyof T, Resolver<any>>

type InjectableDependencies<T> = T & CommonDependencies

interface HttpError {
	status: number
	message: string
}

export type {
	AppInstance,
	DatabaseClient,
	Routes,
	Config,
	AuthConfig,
	DbConfig,
	RedisConfig,
	ExternalDependencies,
	CommonDependencies,
	InjectableDependencies,
	BaseDiConfig,
	HttpError,
}
