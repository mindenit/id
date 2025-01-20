import { hash, verify } from '@node-rs/argon2'
import { IPasswordService } from '../types/index.js'

export class PasswordService implements IPasswordService {
	async hash(password: string): Promise<string> {
		return hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})
	}

	async verifyHash(hash: string, password: string): Promise<boolean> {
		return verify(hash, password)
	}
}
