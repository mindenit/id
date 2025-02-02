import { type FastifyReply } from 'fastify'
import { ICookieService } from '../types/index.js'

export class CookieService implements ICookieService {
	setTokenCookie(reply: FastifyReply, token: string, expiresAt: Date): void {
		if (process.env.NODE_ENV === 'production') {
			reply.header(
				'set-cookie',
				`session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`,
			)
		} else {
			reply.header(
				'set-cookie',
				`session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`,
			)
		}
	}

	deleteTokenCookie(reply: FastifyReply): void {
		if (process.env.NODE_ENV === 'production') {
			reply.header(
				'set-cookie',
				`session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;`,
			)
		} else {
			reply.header(
				'set-cookie',
				`session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
			)
		}
	}
}
