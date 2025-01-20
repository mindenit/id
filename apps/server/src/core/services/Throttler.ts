import { Redis } from 'ioredis'
import { IThrottler, ThrottlingCounter } from '../types/services.js'

export class Throttler implements IThrottler {
	timeoutSeconds: number[]
	private readonly redis: Redis

	constructor(args: { timeoutSeconds: number[]; redis: Redis }) {
		this.timeoutSeconds = args.timeoutSeconds
		this.redis = args.redis
	}

	async consume(key: string): Promise<boolean> {
		const bucketKey = this.getBucketKey(key)

		let counter = await this.getCounter(bucketKey)

		const now = Date.now()

		if (!counter) {
			counter = {
				timeout: 0,
				updatedAt: now,
			}

			await this.redis.set(bucketKey, JSON.stringify(counter))

			return true
		}

		const allowed =
			now - counter.updatedAt >= this.timeoutSeconds[counter.timeout]! * 1000

		if (!allowed) return false

		counter.updatedAt = now
		counter.timeout = Math.min(
			counter.timeout + 1,
			this.timeoutSeconds.length - 1,
		)

		await this.redis.set(bucketKey, JSON.stringify(counter))

		return true
	}

	async reset(key: string): Promise<void> {
		const bucketKey = this.getBucketKey(key)

		await this.redis.getdel(bucketKey)
	}

	private async getCounter(key: string): Promise<ThrottlingCounter | null> {
		const counter = await this.redis.get(key)

		return counter ? JSON.parse(counter) : null
	}

	private getBucketKey(key: string): string {
		return `rate_limit:${key}:count`
	}
}
