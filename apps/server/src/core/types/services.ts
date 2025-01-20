interface IThrottler {
	consume: (key: string) => Promise<boolean>
	reset: (key: string) => Promise<void>
}

interface ThrottlingCounter {
	timeout: number
	updatedAt: number
}

interface IExpiringTokenBucket {
	check: (key: string, cost: number) => Promise<boolean>
	consume: (key: string, cost: number) => Promise<boolean>
	reset: (key: string) => Promise<void>
}

interface ExpiringBucket {
	count: number
	createdAt: number
}

interface IRefillingTokenBucket {
	check: (key: string, cost: number) => Promise<boolean>
	consume: (key: string, cost: number) => Promise<boolean>
}

interface RefillBucket {
	count: number
	refilledAt: number
}

export type {
	IThrottler,
	ThrottlingCounter,
	IExpiringTokenBucket,
	ExpiringBucket,
	IRefillingTokenBucket,
	RefillBucket,
}
