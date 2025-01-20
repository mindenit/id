import { Routes } from '@/core/types/index.js'
import { getUsers } from '../handlers/index.js'

export const getUsersRoutes = (): Routes => ({
	routes: [
		{
			method: 'GET',
			url: '/api/users',
			handler: getUsers,
		},
	],
})
