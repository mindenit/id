import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding'

export const generateString = (): string => {
	const bytes = new Uint8Array(20)

	crypto.getRandomValues(bytes)

	const secret = encodeBase32LowerCaseNoPadding(bytes)

	return secret
}
