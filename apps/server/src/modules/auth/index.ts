import { asClass } from 'awilix'
import { AuthDiConfig } from './types/index.js'
import { CookieService } from './services/CookieService.js'
import { SINGLETON_CONFIG } from '@/core/constants/index.js'
import { PasswordService } from './services/PasswordService.js'
import { SessionsService } from './services/SessionsService.js'

export const resolveAuthModule = (): AuthDiConfig => ({
	cookieService: asClass(CookieService, SINGLETON_CONFIG),
	passwordService: asClass(PasswordService, SINGLETON_CONFIG),
	sessionService: asClass(SessionsService, SINGLETON_CONFIG),
})
