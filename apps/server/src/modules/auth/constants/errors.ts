import { HttpError } from '@/core/types/index.js'

const INVALID_EMAIL_OR_PASSWORD_ERR: HttpError = {
	status: 400,
	message: 'Invalid email or password',
}

const EMAIL_ALREADY_IN_USE_ERR: HttpError = {
	status: 400,
	message: 'Email is already in use',
}

const USERNAME_ALREADY_IN_USE_ERR: HttpError = {
	status: 400,
	message: 'Username is already in use',
}

export {
	INVALID_EMAIL_OR_PASSWORD_ERR,
	EMAIL_ALREADY_IN_USE_ERR,
	USERNAME_ALREADY_IN_USE_ERR,
}
