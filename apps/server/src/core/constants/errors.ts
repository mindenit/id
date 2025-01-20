import { HttpError } from '../types/index.js'

const INTERNAL_SERVER_ERR: HttpError = {
	status: 500,
	message: 'Something went wrong',
}

const TOO_MANY_REQUESTS_ERR: HttpError = {
	status: 429,
	message: 'Too many requests',
}

const NOT_AUTHENTIFICATED_ERR: HttpError = {
	status: 400,
	message: 'Not authentificated',
}

export { INTERNAL_SERVER_ERR, TOO_MANY_REQUESTS_ERR, NOT_AUTHENTIFICATED_ERR }
