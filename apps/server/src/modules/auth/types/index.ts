import { BaseDiConfig, InjectableDependencies } from '@/core/types/index.js'
import { Result } from '@/core/utils/result.js'
import { Session, User } from '@/db/types.js'
import { type FastifyReply } from 'fastify'

interface SessionValidation {
	session: Session
	user: User
}

interface ICookieService {
	setTokenCookie: (reply: FastifyReply, token: string, expiresAt: Date) => void
	deleteTokenCookie: (reply: FastifyReply) => void
}

interface IPasswordService {
	hash: (password: string) => Promise<string>
	verifyHash: (hash: string, password: string) => Promise<boolean>
}

interface ISessionsService {
	createOne: (token: string, userId: number) => Promise<Session>
	validateToken: (token: string) => Promise<Result<SessionValidation, null>>
	invalidateOne: (sessionId: string) => Promise<void>
}

interface AuthModuleDependencies {
	cookieService: ICookieService
	passwordService: IPasswordService
	sessionService: ISessionsService
}

type AuthInjectableDependencies = InjectableDependencies<AuthModuleDependencies>

type AuthDiConfig = BaseDiConfig<AuthModuleDependencies>

export type {
	ISessionsService,
	SessionValidation,
	ICookieService,
	IPasswordService,
	AuthModuleDependencies,
	AuthInjectableDependencies,
	AuthDiConfig,
}
