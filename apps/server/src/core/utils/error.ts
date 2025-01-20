import type { FastifyReply } from 'fastify'
import { HttpError } from '../types/index.js'

export const throwHttpError = (reply: FastifyReply, error: HttpError) => {
	const { status, message } = error

	return reply.status(status).send({ message })
}
