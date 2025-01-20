import {
	BaseDiConfig,
	HttpError,
	InjectableDependencies,
} from '@/core/types/index.js'
import { Result } from '@/core/utils/result.js'
import { User } from '@/db/types.js'
import { SIGNUP_SCHEMA_TYPE } from '@/modules/auth/schemas/index.js'

type FindByParam = Exclude<
	keyof User,
	'createdAt' | 'updatedAt' | 'role' | 'password'
>

interface IUsersRepository {
	findMany: () => Promise<Omit<User, 'password'>[]>
	findOneBy: <K extends FindByParam>(
		by: K,
		value: User[K],
	) => Promise<Result<User, null>>
	createOne: (data: SIGNUP_SCHEMA_TYPE) => Promise<Result<User, HttpError>>
	checkEmailAviability: (email: string) => Promise<boolean>
	checkUsernameAviability: (username: string) => Promise<boolean>
	updateOnePassword: (
		id: number,
		password: string,
	) => Promise<Result<User, HttpError>>
}

interface UsersModuleDependencies {
	usersRepository: IUsersRepository
}

type UsersInjectableDependencies =
	InjectableDependencies<UsersModuleDependencies>

type UsersDiConfig = BaseDiConfig<UsersModuleDependencies>

export type {
	IUsersRepository,
	FindByParam,
	UsersModuleDependencies,
	UsersInjectableDependencies,
	UsersDiConfig,
}
