import { CommonDependencies, ExternalDependencies } from '@/core/types/index.js'
import { resolveAuthModule } from '@/modules/auth/index.js'
import { AwilixContainer, NameAndRegistrationPair } from 'awilix'
import { resolveCommonDiConfig } from './commonDiConfig.js'
import type { AuthModuleDependencies } from '@/modules/auth/types/index.js'
import { resolveUsersModule } from '@/modules/users/index.js'
import type { UsersModuleDependencies } from '@/modules/users/types/index.js'
import { resolveApplicationsModule } from '@/modules/applications/index.js'
import type { ApplicationsModuleDependencies } from '@/modules/applications/types/index.js'

type Dependencies = CommonDependencies &
	AuthModuleDependencies &
	UsersModuleDependencies &
	ApplicationsModuleDependencies

type DiConfig = NameAndRegistrationPair<Dependencies>

export const registerDependencies = (
	diContainer: AwilixContainer,
	dependencies: ExternalDependencies,
): void => {
	const diConfig: DiConfig = {
		...resolveCommonDiConfig(dependencies),
		...resolveAuthModule(),
		...resolveUsersModule(),
		...resolveApplicationsModule(),
	}

	diContainer.register(diConfig)
}

declare module '@fastify/awilix' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Cradle extends Dependencies {}

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface RequestCradle extends Dependencies {}
}
