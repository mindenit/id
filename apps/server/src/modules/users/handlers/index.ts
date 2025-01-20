import { FastifyReply, FastifyRequest } from 'fastify'

export const getUsers = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { usersRepository } = request.diScope.cradle

	const users = await usersRepository.findMany()

	return reply.status(200).send(users)
}
