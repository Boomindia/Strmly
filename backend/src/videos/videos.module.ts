import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { VideosController } from "./videos.controller"
import { VideosService } from "./videos.service"
import { DatabaseModule } from "../db/db.module"
import { UploadModule } from "../upload/upload.module"
import { VideoProcessingModule } from "../video-processing/video-processing.module"
import { Video, VideoSchema } from "../schemas/video.schema"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    DatabaseModule,
    UploadModule,
    VideoProcessingModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
