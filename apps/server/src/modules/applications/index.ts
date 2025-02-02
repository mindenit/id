import { SINGLETON_CONFIG } from '@/core/constants/index.js'
import { asClass } from 'awilix'
import { ApplicationCodesRepository } from './repositories/ApplicationCodesRepository.js'
import { ApplicationSecretsRepository } from './repositories/ApplicationSecretsRepository.js'
import { ApplicationsRepository } from './repositories/ApplicationsRepository.js'
import { ApplicationsDiConfig } from './types/index.js'

export const resolveApplicationsModule = (): ApplicationsDiConfig => ({
	applicationsRepository: asClass(ApplicationsRepository, SINGLETON_CONFIG),
	applicationSecretsRepository: asClass(
		ApplicationSecretsRepository,
		SINGLETON_CONFIG,
	),
	applicationCodesRepository: asClass(
		ApplicationCodesRepository,
		SINGLETON_CONFIG,
	),
})
