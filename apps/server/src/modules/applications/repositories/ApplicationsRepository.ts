import { DUPLICATE_KEY_ERR_CODE } from '@/core/constants/db.js'
import { INTERNAL_SERVER_ERR } from '@/core/constants/errors.js'
import { DatabaseClient, HttpError } from '@/core/types/index.js'
import { Failure, Result, Success } from '@/core/utils/result.js'
import { generateString } from '@/core/utils/string.js'
import {
	applicationClientSecretTable,
	applicationCodeTable,
	applicationTable,
	userApplicationTable,
} from '@/db/schema.js'
import { Application } from '@/db/types.js'
import { eq, and, gt } from 'drizzle-orm'
import postgres from 'postgres'
import {
	APPLICATION_ALREADY_EXISTS_ERR,
	APPLICATION_NOT_FOUND_ERR,
} from '../constants/errors.js'
import { CREATE_APPLICATION_SCHEMA_TYPE } from '../schemas/index.js'
import {
	ApplicationsInjectableDependencies,
	FindByParam,
	IApplicationsRepository,
} from '../types/index.js'

export class ApplicationsRepository implements IApplicationsRepository {
	private readonly db: DatabaseClient

	constructor({ db }: ApplicationsInjectableDependencies) {
		this.db = db.client
	}

	async findOne<K extends FindByParam>(
		by: K,
		value: Application[K],
	): Promise<Result<Application, HttpError>> {
		const result = await this.db
			.select()
			.from(applicationTable)
			.where(eq(applicationTable[by], value))

		const application = result.at(0)

		if (!application) return Failure(APPLICATION_NOT_FOUND_ERR)

		return Success(application)
	}

	async hasValidCode(id: number, code: string): Promise<boolean> {
		const now = new Date()

		const result = await this.db
			.select()
			.from(applicationCodeTable)
			.where(
				and(
					eq(applicationCodeTable.applicationId, id),
					eq(applicationCodeTable.id, code),
					gt(applicationCodeTable.validUntil, now),
				),
			)

		return !!result.at(0)
	}

	async hasSecret(id: number, secret: string): Promise<boolean> {
		const result = await this.db
			.select()
			.from(applicationClientSecretTable)
			.where(
				and(
					eq(applicationClientSecretTable.applicationId, id),
					eq(applicationClientSecretTable.clientSecretId, secret),
				),
			)

		return !!result.at(0)
	}

	async createOne(
		userId: number,
		data: CREATE_APPLICATION_SCHEMA_TYPE,
	): Promise<Result<Application, HttpError>> {
		try {
			const clientId = generateString()

			const result = await this.db.transaction(async (tx) => {
				const applications = await tx
					.insert(applicationTable)
					.values({ ...data, clientId, img: '/' })
					.returning()

				const application = applications.at(0)!

				await tx
					.insert(userApplicationTable)
					.values({ userId, applicationId: application.id })

				return application
			})

			return Success(result)
		} catch (e: unknown) {
			if (
				e instanceof postgres.PostgresError &&
				e.code === DUPLICATE_KEY_ERR_CODE
			) {
				return Failure(APPLICATION_ALREADY_EXISTS_ERR)
			}

			return Failure(INTERNAL_SERVER_ERR)
		}
	}
}
