import { FastifyReply, FastifyRequest } from 'fastify'
import { LOGIN_SCHEMA_TYPE, SIGNUP_SCHEMA_TYPE } from '../schemas/index.js'
import { throwHttpError } from '@/core/utils/error.js'
import {
	NOT_AUTHENTIFICATED_ERR,
	TOO_MANY_REQUESTS_ERR,
} from '@/core/constants/errors.js'
import {
	EMAIL_ALREADY_IN_USE_ERR,
	INVALID_EMAIL_OR_PASSWORD_ERR,
	USERNAME_ALREADY_IN_USE_ERR,
} from '../constants/errors.js'
import { LOGOUT_SUCCESSFUL_MSG } from '../constants/messages.js'

export const login = async (
	request: FastifyRequest<{ Body: LOGIN_SCHEMA_TYPE }>,
	reply: FastifyReply,
): Promise<void> => {
	const { email, password } = request.body
	const {
		globalBucket,
		ipBucket,
		throttler,
		usersRepository,
		passwordService,
		sessionService,
		cookieService,
	} = request.diScope.cradle

	const clientIp = request.ip

	if (!(await globalBucket.consume(clientIp, 3))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	if (!(await ipBucket.check(clientIp, 1))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	const result = await usersRepository.findOneBy('email', email)

	if (!result.success)
		return throwHttpError(reply, INVALID_EMAIL_OR_PASSWORD_ERR)

	const user = result.value

	if (!(await ipBucket.consume(clientIp, 1))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	if (!(await throttler.consume(user.id.toString()))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	const isPasswordValid = await passwordService.verifyHash(
		user.password,
		password,
	)

	if (!isPasswordValid) {
		return throwHttpError(reply, INVALID_EMAIL_OR_PASSWORD_ERR)
	}

	await throttler.reset(user.id.toString())

	const sessionToken = sessionService.generateToken()

	const session = await sessionService.createOne(sessionToken, user.id)

	cookieService.setTokenCookie(reply, sessionToken, session.expiresAt)

	return reply.status(200).send()
}

export const signup = async (
	request: FastifyRequest<{ Body: SIGNUP_SCHEMA_TYPE }>,
	reply: FastifyReply,
): Promise<void> => {
	const { email, username, password } = request.body
	const {
		globalBucket,
		ipBucket,
		usersRepository,
		passwordService,
		sessionService,
		cookieService,
	} = request.diScope.cradle

	const clientIp = request.ip

	if (!(await globalBucket.consume(clientIp, 3))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	if (!(await ipBucket.check(clientIp, 1))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	const isEmailAviable = await usersRepository.checkEmailAviability(email)

	if (!isEmailAviable) return throwHttpError(reply, EMAIL_ALREADY_IN_USE_ERR)

	const isUsernameAviable =
		await usersRepository.checkUsernameAviability(username)

	if (!isUsernameAviable) {
		return throwHttpError(reply, USERNAME_ALREADY_IN_USE_ERR)
	}

	if (!(await ipBucket.consume(clientIp, 1))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	const hashedPassword = await passwordService.hash(password)

	const result = await usersRepository.createOne({
		email,
		username,
		password: hashedPassword,
	})

	if (!result.success) return throwHttpError(reply, result.error)

	const user = result.value

	const sessionToken = sessionService.generateToken()
	const session = await sessionService.createOne(sessionToken, user.id)

	cookieService.setTokenCookie(reply, sessionToken, session.expiresAt)

	return reply.status(200).send()
}

export const logout = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { globalBucket, sessionService, cookieService } = request.diScope.cradle

	const clientIp = request.ip

	if (!(await globalBucket.consume(clientIp, 3))) {
		return throwHttpError(reply, TOO_MANY_REQUESTS_ERR)
	}

	const { session } = request

	if (!session) return throwHttpError(reply, NOT_AUTHENTIFICATED_ERR)

	await sessionService.invalidateOne(session.id)

	cookieService.deleteTokenCookie(reply)

	return reply.status(200).send(LOGOUT_SUCCESSFUL_MSG)
}

export const me = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const { session, user } = request

	if (!session || !user) return throwHttpError(reply, NOT_AUTHENTIFICATED_ERR)

	return reply.status(200).send(user)
}

export const resetPassword = async (): Promise<void> => {}
