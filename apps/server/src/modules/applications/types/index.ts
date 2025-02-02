import {
	BaseDiConfig,
	HttpError,
	InjectableDependencies,
} from '@/core/types/index.js'
import { Result } from '@/core/utils/result.js'
import { Application, ApplicationCode, ClientSecret } from '@/db/types.js'
import { CREATE_APPLICATION_SCHEMA_TYPE } from '../schemas/index.js'

type FindByParam = Extract<keyof Application, 'id' | 'clientId'>

interface IApplicationsRepository {
	findOne: <K extends FindByParam>(
		by: K,
		value: Application[K],
	) => Promise<Result<Application, HttpError>>
	createOne: (
		userId: number,
		data: CREATE_APPLICATION_SCHEMA_TYPE,
	) => Promise<Result<Application, HttpError>>
	hasValidCode: (id: number, code: string) => Promise<boolean>
	hasSecret: (id: number, secret: string) => Promise<boolean>
}

interface IApplicationSecretsRepository {
	findOne: (secret: string) => Promise<Result<ClientSecret, null>>
	createOne: (id: number) => Promise<Result<ClientSecret, HttpError>>
	updateOne: (secret: string) => Promise<void>
}

interface IApplicationCodesRepository {
	findOne: (code: string) => Promise<Result<ApplicationCode, HttpError>>
	createOne: (id: number) => Promise<Result<ApplicationCode, HttpError>>
	invalidateOne: (code: string) => Promise<void>
	isValid: (code: ApplicationCode) => boolean
}

interface ApplicationsModuleDependencies {
	applicationsRepository: IApplicationsRepository
	applicationSecretsRepository: IApplicationSecretsRepository
	applicationCodesRepository: IApplicationCodesRepository
}

type ApplicationsInjectableDependencies =
	InjectableDependencies<ApplicationsModuleDependencies>

type ApplicationsDiConfig = BaseDiConfig<ApplicationsModuleDependencies>

export type {
	ApplicationsDiConfig,
	ApplicationsInjectableDependencies,
	ApplicationsModuleDependencies,
	IApplicationsRepository,
	IApplicationSecretsRepository,
	IApplicationCodesRepository,
	FindByParam,
}
