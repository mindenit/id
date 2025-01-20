import type { Redis } from 'ioredis'
import { ExpiringBucket, IExpiringTokenBucket } from '../types/services.js'

export class ExpiringTokenBucket implements IExpiringTokenBucket {
	max: number
	expiresInSeconds: number
	private readonly redis: Redis

	constructor(args: { max: number; expiresInSeconds: number; redis: Redis }) {
		this.max = args.max
		this.expiresInSeconds = args.expiresInSeconds
		this.redis = args.redis
	}

	async check(key: string, cost: number): Promise<boolean> {
		const bucketKey = this.getBucketKey(key)

		const bucket = await this.getBucket(bucketKey)

		const now = Date.now()

		if (!bucket) return true

		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			return true
		}

		return bucket.count >= cost
	}

	async consume(key: string, cost: number): Promise<boolean> {
		const bucketKey = this.getBucketKey(key)

		let bucket = await this.getBucket(bucketKey)

		const now = Date.now()

		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				createdAt: now,
			}

			await this.redis.set(bucketKey, JSON.stringify(bucket))

			return true
		}

		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			bucket.count = this.max
		}

		if (bucket.count < cost) {
			return false
		}

		bucket.count -= cost

		await this.redis.set(bucketKey, JSON.stringify(bucket))

		return true
	}

	async reset(key: string): Promise<void> {
		await this.redis.getdel(key)
	}

	private async getBucket(key: string): Promise<ExpiringBucket | null> {
		const data = await this.redis.get(key)

		return data ? JSON.parse(data) : null
	}

	private getBucketKey(key: string): string {
		return `rate_limit:${key}:last_expiration`
	}
}
