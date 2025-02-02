import { INTERNAL_SERVER_ERR } from '@/core/constants/errors.js'
import { DatabaseClient, HttpError } from '@/core/types/index.js'
import { Failure, Result, Success } from '@/core/utils/result.js'
import { generateString } from '@/core/utils/string.js'
import { applicationClientSecretTable, clientSecretTable } from '@/db/schema.js'
import { ClientSecret } from '@/db/types.js'
import { eq } from 'drizzle-orm'
import {
	ApplicationsInjectableDependencies,
	IApplicationSecretsRepository,
} from '../types/index.js'

export class ApplicationSecretsRepository
	implements IApplicationSecretsRepository
{
	private readonly db: DatabaseClient

	constructor({ db }: ApplicationsInjectableDependencies) {
		this.db = db.client
	}

	async findOne(secret: string): Promise<Result<ClientSecret, null>> {
		const result = await this.db
			.select()
			.from(clientSecretTable)
			.where(eq(clientSecretTable.secret, secret))

		const clientSecret = result.at(0)

		if (!clientSecret) return Failure(null)

		return Success(clientSecret)
	}

	async createOne(id: number): Promise<Result<ClientSecret, HttpError>> {
		try {
			const secret = await this.db.transaction(async (tx) => {
				const result = await tx
					.insert(clientSecretTable)
					.values({ secret: generateString() })
					.returning()

				const clientSecret = result.at(0)!

				await tx.insert(applicationClientSecretTable).values({
					applicationId: id,
					clientSecretId: clientSecret.secret,
				})

				return clientSecret
			})

			return Success(secret)
		} catch {
			return Failure(INTERNAL_SERVER_ERR)
		}
	}

	async updateOne(secret: string): Promise<void> {
		await this.db
			.update(clientSecretTable)
			.set({ usedAt: new Date() })
			.where(eq(clientSecretTable.secret, secret))
	}
}
