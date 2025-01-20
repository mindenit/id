import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from '@oslojs/encoding'
import {
	AuthInjectableDependencies,
	ISessionsService,
	SessionValidation,
} from '../types/index.js'
import { DatabaseClient } from '@/core/types/index.js'
import { Session } from '@/db/types.js'
import { sha256 } from '@oslojs/crypto/sha2'
import { sessionTable, userTable } from '@/db/schema.js'
import { Failure, Result, Success } from '@/core/utils/result.js'
import { eq } from 'drizzle-orm'

export class SessionsService implements ISessionsService {
	private readonly db: DatabaseClient

	constructor({ db }: AuthInjectableDependencies) {
		this.db = db.client
	}

	generateToken(): string {
		const bytes = new Uint8Array(20)

		crypto.getRandomValues(bytes)

		const token = encodeBase32LowerCaseNoPadding(bytes)

		return token
	}

	async createOne(token: string, userId: number): Promise<Session> {
		const sessionId = encodeHexLowerCase(
			sha256(new TextEncoder().encode(token)),
		)

		const session: Session = {
			id: sessionId,
			createdAt: new Date(),
			userId,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		}

		await this.db.insert(sessionTable).values(session)

		return session
	}

	async validateToken(token: string): Promise<Result<SessionValidation, null>> {
		const sessionId = encodeHexLowerCase(
			sha256(new TextEncoder().encode(token)),
		)

		const result = await this.db
			.select({
				user: userTable,
				session: sessionTable,
			})
			.from(sessionTable)
			.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
			.where(eq(sessionTable.id, sessionId))

		if (!result.length) {
			return Failure(null)
		}

		const { user, session } = result.at(0) as SessionValidation

		if (Date.now() >= session.expiresAt.getTime()) {
			await this.db.delete(sessionTable).where(eq(sessionTable.id, session.id))

			return Failure(null)
		}

		if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
			session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

			await this.db
				.update(sessionTable)
				.set({ expiresAt: session.expiresAt })
				.where(eq(sessionTable.id, session.id))
		}

		return Success({ user, session })
	}

	async invalidateOne(sessionId: string): Promise<void> {
		await this.db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
	}
}
