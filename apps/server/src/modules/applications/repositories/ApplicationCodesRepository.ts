import { DatabaseClient, HttpError } from '@/core/types/index.js'
import {
	ApplicationsInjectableDependencies,
	IApplicationCodesRepository,
} from '../types/index.js'
import { ApplicationCode } from '@/db/types.js'
import { Failure, Result, Success } from '@/core/utils/result.js'
import { applicationCodeTable } from '@/db/schema.js'
import { eq } from 'drizzle-orm'
import { INVALID_APPLICATION_CODE } from '../constants/errors.js'
import { INTERNAL_SERVER_ERR } from '@/core/constants/errors.js'
import { generateString } from '@/core/utils/string.js'

export class ApplicationCodesRepository implements IApplicationCodesRepository {
	private readonly db: DatabaseClient

	constructor({ db }: ApplicationsInjectableDependencies) {
		this.db = db.client
	}

	async findOne(code: string): Promise<Result<ApplicationCode, HttpError>> {
		const result = await this.db
			.select()
			.from(applicationCodeTable)
			.where(eq(applicationCodeTable.id, code))

		const applicationCode = result.at(0)

		if (!applicationCode) return Failure(INVALID_APPLICATION_CODE)

		return Success(applicationCode)
	}

	async createOne(id: number): Promise<Result<ApplicationCode, HttpError>> {
		try {
			const code = generateString()
			const validUntil = new Date(Date.now() + 1000 * 60 * 5)

			const result = await this.db
				.insert(applicationCodeTable)
				.values({ id: code, applicationId: id, validUntil })
				.returning()

			const applicationCode = result.at(0)!

			return Success(applicationCode)
		} catch {
			return Failure(INTERNAL_SERVER_ERR)
		}
	}

	async invalidateOne(code: string): Promise<void> {
		await this.db
			.delete(applicationCodeTable)
			.where(eq(applicationCodeTable.id, code))
	}

	isValid(code: ApplicationCode): boolean {
		return Date.now() >= code.validUntil.getTime()
	}
}
