import 'dotenv/config.js'
import { App } from './app.js'
import { Session, User } from './db/types.js'

async function startServer() {
	try {
		const app = new App()
		const server = await app.initialize()

		await server.listen({ port: 8080, host: '0.0.0.0' })

		console.log(`Server is running on port ${8080}`)
	} catch (err) {
		console.error('Error starting server:', err)
		process.exit(1)
	}
}

startServer()

declare module 'fastify' {
	interface FastifyRequest {
		user: User | null
		session: Session | null
	}

	export interface FastifyInstance {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		authentificate: any
	}
}
