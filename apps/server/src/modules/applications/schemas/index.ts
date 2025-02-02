import { z } from 'zod'

const GET_APPLICATION_PARAM_SCHEMA = z
	.object({
		clientId: z
			.string({
				invalid_type_error: 'Client ID should be string',
				required_error: 'Please enter application client ID',
			})
			.nonempty('Client ID cannot be empty'),
	})
	.strict('Only clientId field is accepted')

type GET_APPLICATION_SCHEMA_TYPE = z.infer<typeof GET_APPLICATION_PARAM_SCHEMA>

const REDIRECT_URI_SCHEMA = z
	.string({
		invalid_type_error: 'Callback URL should be string',
		required_error: 'Please enter application callback URI',
	})
	.url('Callback URI should be valid')

const CREATE_APPLICATION_SCHEMA = z
	.object({
		name: z
			.string({
				invalid_type_error: 'Name should be string',
				required_error: 'Please enter application name',
			})
			.min(2, 'Name should be at least 2 characters long')
			.max(50, 'Name cannot be longer than 50 characters'),
		description: z
			.string({
				invalid_type_error: 'Description should be string',
				required_error: 'Please enter application description',
			})
			.min(10, 'Description should be at least 10 characters long')
			.max(500, 'Description cannot be longer than 500 characters'),
		redirectUri: REDIRECT_URI_SCHEMA,
		homepageUri: z
			.string({
				invalid_type_error: 'Homepage URL should be string',
				required_error: 'Please enter application homepage URL',
			})
			.url('Homepage URL should be valid'),
	})
	.strict('Only name, description, callback and homepage urls are accepted')

type CREATE_APPLICATION_SCHEMA_TYPE = z.infer<typeof CREATE_APPLICATION_SCHEMA>

export {
	GET_APPLICATION_PARAM_SCHEMA,
	type GET_APPLICATION_SCHEMA_TYPE,
	CREATE_APPLICATION_SCHEMA,
	type CREATE_APPLICATION_SCHEMA_TYPE,
	REDIRECT_URI_SCHEMA,
}
