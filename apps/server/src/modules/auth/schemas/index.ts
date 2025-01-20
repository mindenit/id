import { z } from 'zod'

const LOGIN_SCHEMA = z
	.object({
		email: z
			.string({
				invalid_type_error: 'Email should be string',
				required_error: 'Please enter your email',
			})
			.email('Email should be valid')
			.nonempty('Please enter your email'),
		password: z
			.string({
				invalid_type_error: 'Password should be string',
				required_error: 'Please enter your password',
			})
			.min(8, 'Password must be at least 8 characters long'),
	})
	.strict('Only email and password fields are accepted')

type LOGIN_SCHEMA_TYPE = z.infer<typeof LOGIN_SCHEMA>

const SIGNUP_SCHEMA = LOGIN_SCHEMA.extend({
	username: z
		.string({
			invalid_type_error: 'Username should be string',
			required_error: 'Please enter your username',
		})
		.min(2, 'Username should be at least 2 characters long')
		.max(25, 'Username cannot be longer than 25 characters'),
}).strict('Only email, password and username fields are accepted')

type SIGNUP_SCHEMA_TYPE = z.infer<typeof SIGNUP_SCHEMA>

export {
	LOGIN_SCHEMA,
	type LOGIN_SCHEMA_TYPE,
	SIGNUP_SCHEMA,
	type SIGNUP_SCHEMA_TYPE,
}
