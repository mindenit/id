import { DUPLICATE_KEY_ERR_CODE } from '@/core/constants/db.js'
import { INTERNAL_SERVER_ERR } from '@/core/constants/errors.js'
import { DatabaseClient, HttpError } from '@/core/types/index.js'
import { Failure, Result, Success } from '@/core/utils/result.js'
import { userTable } from '@/db/schema.js'
import { User } from '@/db/types.js'
import { SIGNUP_SCHEMA_TYPE } from '@/modules/auth/schemas/index.js'
import { eq, getTableColumns } from 'drizzle-orm'
import postgres from 'postgres'
import { USER_ALREADY_EXISTS_ERR } from '../constants/errors.js'
import type {
	FindByParam,
	IUsersRepository,
	UsersInjectableDependencies,
} from '../types/index.js'

export class UsersRepository implements IUsersRepository {
	private readonly db: DatabaseClient

	constructor({ db }: UsersInjectableDependencies) {
		this.db = db.client
	}

	async findMany(): Promise<Omit<User, 'password'>[]> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...rest } = getTableColumns(userTable)

		return this.db.select({ ...rest }).from(userTable)
	}

	async findOneBy<K extends FindByParam>(
		by: K,
		value: User[K],
	): Promise<Result<User, null>> {
		const result = await this.db
			.select()
			.from(userTable)
			.where(eq(userTable[by], value))

		const user = result.at(0)

		if (!user) return Failure(null)

		return Success(user)
	}

	async createOne(data: SIGNUP_SCHEMA_TYPE): Promise<Result<User, HttpError>> {
		try {
			const hasUsers = !!(await this.db.select().from(userTable).limit(1))
				.length

			const result = await this.db
				.insert(userTable)
				.values({ ...data, role: hasUsers ? 'user' : 'supervisor' })
				.returning()

			const user = result.at(0)!

			return Success(user)
		} catch (e: unknown) {
			if (
				e instanceof postgres.PostgresError &&
				e.code === DUPLICATE_KEY_ERR_CODE
			) {
				return Failure(USER_ALREADY_EXISTS_ERR)
			}

			return Failure(INTERNAL_SERVER_ERR)
		}
	}

	async checkEmailAviability(email: string): Promise<boolean> {
		return this.checkFieldAviability('email', email)
	}

	async checkUsernameAviability(username: string) {
		return this.checkFieldAviability('username', username)
	}

	async updateOnePassword(
		id: number,
		password: string,
	): Promise<Result<User, HttpError>> {
		try {
			const result = await this.db
				.update(userTable)
				.set({ password })
				.where(eq(userTable.id, id))
				.returning()

			return Success(result.at(0)!)
		} catch {
			return Failure(INTERNAL_SERVER_ERR)
		}
	}

	private async checkFieldAviability(
		field: 'email' | 'username',
		value: string,
	): Promise<boolean> {
		const result = await this.db
			.select()
			.from(userTable)
			.where(eq(userTable[field], value))

		return result.length === 0
	}
}
