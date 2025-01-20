import { AppInstance, Routes } from '@/core/types/index.js'
import { login, logout, me, signup } from '../handlers/index.js'
import { LOGIN_SCHEMA, SIGNUP_SCHEMA } from '../schemas/index.js'

export const getAuthRoutes = (app: AppInstance): Routes => ({
	routes: [
		{
			method: 'POST',
			url: '/api/login',
			handler: login,
			schema: {
				body: LOGIN_SCHEMA,
			},
		},
		{
			method: 'POST',
			url: '/api/signup',
			handler: signup,
			schema: {
				body: SIGNUP_SCHEMA,
			},
		},
		{
			method: 'DELETE',
			url: '/api/logout',
			handler: logout,
			preHandler: [app.authentificate],
		},
		{
			method: 'GET',
			url: '/api/me',
			handler: me,
			preHandler: [app.authentificate],
		},
	],
})
