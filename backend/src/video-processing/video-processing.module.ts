import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bull"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { VideoProcessingService } from "./video-processing.service"
import { VideoProcessingProcessor } from "./video-processing.processor"
import { VideoProcessingController } from "./video-processing.controller"
import { UploadModule } from "../upload/upload.module"

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST", "localhost"),
          port: configService.get("REDIS_PORT", 6379),
          password: configService.get("REDIS_PASSWORD"),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: "video-processing",
    }),
    UploadModule,
  ],
  providers: [VideoProcessingService, VideoProcessingProcessor],
  controllers: [VideoProcessingController],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}
