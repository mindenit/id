import { FastifyReply, FastifyRequest } from 'fastify'
import { throwHttpError } from '../utils/error.js'
import { NOT_AUTHENTIFICATED_ERR } from '../constants/errors.js'

export const sessionGuard = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { sessionService } = request.diScope.cradle
	const token = request.cookies.session

	if (!token) {
		return throwHttpError(reply, NOT_AUTHENTIFICATED_ERR)
	}

	const result = await sessionService.validateToken(token)

	if (!result.success) {
		return throwHttpError(reply, NOT_AUTHENTIFICATED_ERR)
	}

	console.log('Guard', result.value)

	request.user = result.value.user
	request.session = result.value.session
}
