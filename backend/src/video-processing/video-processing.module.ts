import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bull"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { VideoProcessingService } from "./video-processing.service"
import { VideoProcessingProcessor } from "./video-processing.processor"
import { VideoProcessingController } from "./video-processing.controller"
import { UploadModule } from "../upload/upload.module"
import { MongooseModule } from "@nestjs/mongoose"
import { Video, VideoSchema } from "../schemas/video.schema"

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST", "localhost"),
          port: configService.get("REDIS_PORT", 6379),
          password: configService.get("REDIS_PASSWORD"),
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: false,
          timeout: 300000 // 5 minutes timeout for video processing
        }
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: "video-processing",
    }),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    UploadModule,
  ],
  providers: [VideoProcessingService, VideoProcessingProcessor],
  controllers: [VideoProcessingController],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}
