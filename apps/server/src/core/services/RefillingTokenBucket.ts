import { Redis } from 'ioredis'
import { IRefillingTokenBucket, RefillBucket } from '../types/services.js'

export class RefillingTokenBucket implements IRefillingTokenBucket {
	max: number
	refillIntervalSeconds: number
	private readonly redis: Redis

	constructor(args: {
		max: number
		refillIntervalSeconds: number
		redis: Redis
	}) {
		this.max = args.max
		this.refillIntervalSeconds = args.refillIntervalSeconds
		this.redis = args.redis
	}

	async check(key: string, cost: number): Promise<boolean> {
		const bucketKey = this.getBucketKey(key)

		const bucket = await this.getBucket(bucketKey)

		if (!bucket) return true

		const now = Date.now()
		const refill = Math.floor(
			(now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
		)

		if (refill > 0) {
			return Math.min(bucket.count + refill, this.max) >= cost
		}

		return bucket.count >= cost
	}

	async consume(key: string, cost: number): Promise<boolean> {
		const bucketKey = this.getBucketKey(key)

		let bucket = await this.getBucket(bucketKey)

		const now = Date.now()

		if (!bucket) {
			bucket = {
				count: this.max - cost,
				refilledAt: now,
			}

			await this.redis.set(key, JSON.stringify(bucket))

			return true
		}

		const refill = Math.floor(
			(now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
		)

		bucket.count = Math.min(bucket.count + refill, this.max)
		bucket.refilledAt = now

		if (bucket.count < cost) return false

		bucket.count -= cost

		await this.redis.set(key, JSON.stringify(bucket))

		return true
	}

	private async getBucket(key: string): Promise<RefillBucket | null> {
		const data = await this.redis.get(key)

		return data ? JSON.parse(data) : null
	}

	private getBucketKey(key: string): string {
		return `rate_limit:${key}:last_refill`
	}
}
