import { AppInstance, Routes } from '@/core/types/index.js'
import { getUsersRoutes } from './users/routes/index.js'
import { getAuthRoutes } from './auth/routes/index.js'

export const getRoutes = (app: AppInstance): Routes => {
	const { routes: authRoutes } = getAuthRoutes(app)
	const { routes: usersRoutes } = getUsersRoutes()

	return {
		routes: [
			{
				method: 'GET',
				url: '/api/health',
				handler: (_, reply) => {
					const data = {
						uptime: process.uptime(),
						message: 'Helthy!',
						data: new Date(),
					}

					return reply.status(200).send(data)
				},
			},
			...authRoutes,
			...usersRoutes,
		],
	}
}
