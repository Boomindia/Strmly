import { Module } from "@nestjs/common"
import { CacheModule } from "@nestjs/cache-manager"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { redisStore } from "cache-manager-redis-yet"
import { CacheService } from "./cache.service"

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
        ttl: 60 * 60 * 24, // 24 hours default TTL
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
