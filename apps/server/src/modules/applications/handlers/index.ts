import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CREATE_APPLICATION_SCHEMA_TYPE,
	GET_APPLICATION_SCHEMA_TYPE,
} from '../schemas/index.js'
import { throwHttpError } from '@/core/utils/error.js'

export const getApplication = async (
	request: FastifyRequest<{ Params: GET_APPLICATION_SCHEMA_TYPE }>,
	reply: FastifyReply,
): Promise<void> => {
	const { clientId } = request.params
	const { applicationsRepository } = request.diScope.cradle

	const result = await applicationsRepository.findOne('clientId', clientId)

	if (!result.success) return throwHttpError(reply, result.error)

	return reply.status(200).send(result.value)
}

export const createApplication = async (
	request: FastifyRequest<{ Body: CREATE_APPLICATION_SCHEMA_TYPE }>,
	reply: FastifyReply,
): Promise<void> => {
	const { id } = request.user
	const { applicationsRepository } = request.diScope.cradle

	console.log('Controller', request.user)

	const result = await applicationsRepository.createOne(id, request.body)

	if (!result.success) return throwHttpError(reply, result.error)

	return reply.status(201).send(result.value)
}
