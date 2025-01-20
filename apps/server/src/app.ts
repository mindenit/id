import fastify from 'fastify'
import {
	validatorCompiler,
	serializerCompiler,
	type ZodTypeProvider,
	createJsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors'
import { fastifyHelmet } from '@fastify/helmet'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyCookie from '@fastify/cookie'
import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix'
import { env } from './env.js'
import { AppInstance } from './core/types/index.js'
import { getRoutes } from './modules/index.js'
import { registerDependencies } from './infrastructure/parentDiConfig.js'
import { sessionGuard } from './core/guards/sessionGuard.js'

export class App {
	private app: AppInstance

	constructor() {
		this.app = fastify({
			logger: {
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
					},
				},
			},
		})
	}

	private async registerPlugins(): Promise<void> {
		this.app.setValidatorCompiler(validatorCompiler)
		this.app.setSerializerCompiler(serializerCompiler)

		this.app.register(fastifyCors, {
			origin: '*',
			credentials: true,
			methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		})

		this.app.register(fastifyHelmet)

		await this.app.register(fastifySwagger, {
			transform: createJsonSchemaTransform({
				skipList: [
					'/documentation',
					'/documentation/initOAuth',
					'/documentation/json',
					'/documentation/uiConfig',
					'/documentation/yaml',
					'/documentation/*',
					'/documentation/static/*',
					'*',
				],
			}),
			openapi: {
				info: {
					title: 'Mindenit ID Backend',
					description: 'Mindenit auth provider',
					version: '0.0.0',
				},
			},
		})

		await this.app.register(fastifySwaggerUi, {
			routePrefix: '/api',
		})

		await this.app.register(fastifyAwilixPlugin, {
			disposeOnClose: true,
			asyncDispose: true,
			asyncInit: true,
			eagerInject: true,
			disposeOnResponse: true,
		})

		await this.app.register(fastifyCookie, {
			secret: env.COOKIE_SECRET,
			hook: 'preHandler',
		})

		this.app.addHook('preHandler', (req, res, next) => {
			req.session = null
			req.user = null

			return next()
		})

		this.app.decorate('authentificate', sessionGuard)

		registerDependencies(diContainer, { app: this.app })
	}

	private registerRoutes(): void {
		const { routes } = getRoutes(this.app)

		for (const route of routes) {
			this.app.withTypeProvider<ZodTypeProvider>().route(route)
		}
	}

	async initialize(): Promise<AppInstance> {
		try {
			await this.registerPlugins()

			this.app.after(() => {
				this.registerRoutes()
			})

			await this.app.ready()

			return this.app
		} catch (e: unknown) {
			this.app.log.error('Error while initializing app: ', e)
			throw e
		}
	}
}
