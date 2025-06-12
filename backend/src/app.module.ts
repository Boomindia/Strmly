import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ThrottlerModule } from "@nestjs/throttler"
import { MongooseModule } from "@nestjs/mongoose"
import { PrismaModule } from "./prisma/prisma.module"
import { DatabaseModule } from "./db/db.module"
import { RedisCacheModule } from "./cache/cache.module"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { VideosModule } from "./videos/videos.module"
import { UploadModule } from "./upload/upload.module"
import { VideoProcessingModule } from "./video-processing/video-processing.module"
// import { CommunitiesModule } from "./communities/communities.module"
// import { SearchModule } from "./search/search.module"
import { WalletModule } from "./wallet/wallet.module"
// import { LiveStreamingModule } from "./live-streaming/live-streaming.module"
// import { NotificationsModule } from "./notifications/notifications.module"
// import { ChatModule } from "./chat/chat.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 3,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 20,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    DatabaseModule,
    RedisCacheModule,
    AuthModule,
    UsersModule,
    VideosModule,
    UploadModule,
    VideoProcessingModule,
    // CommunitiesModule,
    // SearchModule,
    WalletModule,
    // LiveStreamingModule,
    // NotificationsModule,
    // ChatModule,
  ],
})
export class AppModule {}
