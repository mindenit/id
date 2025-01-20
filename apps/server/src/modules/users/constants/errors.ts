import { HttpError } from '@/core/types/index.js'

export const USER_ALREADY_EXISTS_ERR: HttpError = {
	status: 400,
	message: 'User with such email or username already exists',
}
