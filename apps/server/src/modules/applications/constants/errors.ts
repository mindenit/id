import { HttpError } from '@/core/types/index.js'

const APPLICATION_NOT_FOUND_ERR: HttpError = {
	status: 404,
	message: 'Application not found',
}

const APPLICATION_ALREADY_EXISTS_ERR: HttpError = {
	status: 400,
	message: 'This name is already taken',
}

const INVALID_REDIRECT_URI_ERR: HttpError = {
	status: 400,
	message: 'Invalid redirect url',
}

const INVALID_APPLICATION_CODE: HttpError = {
	status: 400,
	message: 'Invalid application code',
}

export {
	APPLICATION_ALREADY_EXISTS_ERR,
	APPLICATION_NOT_FOUND_ERR,
	INVALID_REDIRECT_URI_ERR,
	INVALID_APPLICATION_CODE,
}
