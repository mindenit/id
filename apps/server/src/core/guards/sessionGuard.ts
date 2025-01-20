import { FastifyReply, FastifyRequest } from 'fastify'

export const sessionGuard = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { sessionService } = request.diScope.cradle
	const token = request.cookies.session

	if (!token) {
		return reply.status(401).send({ message: '' })
	}

	const result = await sessionService.validateToken(token)

	if (!result.success) return

	request.user = result.value.user
	request.session = result.value.session
}
