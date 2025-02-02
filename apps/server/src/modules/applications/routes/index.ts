import { AppInstance, Routes } from '@/core/types/index.js'
import { createApplication, getApplication } from '../handlers/index.js'
import {
	CREATE_APPLICATION_SCHEMA,
	GET_APPLICATION_PARAM_SCHEMA,
} from '../schemas/index.js'

export const getApplicationRoutes = (app: AppInstance): Routes => ({
	routes: [
		{
			method: 'POST',
			url: '/api/applications',
			handler: createApplication,
			schema: {
				body: CREATE_APPLICATION_SCHEMA,
			},
			preHandler: [app.authentificate],
		},
		{
			method: 'GET',
			url: '/api/applications/:clientId',
			handler: getApplication,
			schema: {
				params: GET_APPLICATION_PARAM_SCHEMA,
			},
		},
	],
})
