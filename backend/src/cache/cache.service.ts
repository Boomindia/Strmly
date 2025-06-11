import { Injectable, Inject } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import type { Cache } from "cache-manager"

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl)
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  // async reset(): Promise<void> {
  //   await this.cacheManager.reset()
  // }

  // User session caching
  async setUserSession(userId: string, sessionData: any, ttl = 86400): Promise<void> {
    await this.set(`user_session:${userId}`, sessionData, ttl)
  }

  async getUserSession(userId: string): Promise<any> {
    return await this.get(`user_session:${userId}`)
  }

  async deleteUserSession(userId: string): Promise<void> {
    await this.del(`user_session:${userId}`)
  }

  // Token caching
  async setToken(tokenId: string, tokenData: any, ttl = 3600): Promise<void> {
    await this.set(`token:${tokenId}`, tokenData, ttl)
  }

  async getToken(tokenId: string): Promise<any> {
    return await this.get(`token:${tokenId}`)
  }

  async deleteToken(tokenId: string): Promise<void> {
    await this.del(`token:${tokenId}`)
  }

  // Video caching
  async cacheVideoData(videoId: string, videoData: any, ttl = 1800): Promise<void> {
    await this.set(`video:${videoId}`, videoData, ttl)
  }

  async getCachedVideoData(videoId: string): Promise<any> {
    return await this.get(`video:${videoId}`)
  }

  // User profile caching
  async cacheUserProfile(userId: string, profileData: any, ttl = 3600): Promise<void> {
    await this.set(`user_profile:${userId}`, profileData, ttl)
  }

  async getCachedUserProfile(userId: string): Promise<any> {
    return await this.get(`user_profile:${userId}`)
  }

  async invalidateUserProfile(userId: string): Promise<void> {
    await this.del(`user_profile:${userId}`)
  }

  // Search results caching
  async cacheSearchResults(query: string, results: any, ttl = 900): Promise<void> {
    const key = `search:${Buffer.from(query).toString("base64")}`
    await this.set(key, results, ttl)
  }

  async getCachedSearchResults(query: string): Promise<any> {
    const key = `search:${Buffer.from(query).toString("base64")}`
    return await this.get(key)
  }

  // Rate limiting helpers
  async incrementRateLimit(key: string, ttl = 3600): Promise<number> {
    const current = (await this.get<number>(key)) || 0
    const newValue = current + 1
    await this.set(key, newValue, ttl)
    return newValue
  }

  async getRateLimit(key: string): Promise<number> {
    return (await this.get<number>(key)) || 0
  }
}
