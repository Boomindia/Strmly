import { Processor, Process } from "@nestjs/bull"
import type { Job } from "bull"
import { Logger } from "@nestjs/common"
import { VideoProcessingService } from "./video-processing.service"
import { PrismaService } from "../prisma/prisma.service"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Video } from "../schemas/video.schema"
import type { VideoDocument } from "../schemas/video.schema"
import type { VideoProcessingJob } from "./video-processing.service"

@Processor("video-processing")
export class VideoProcessingProcessor {
  private readonly logger = new Logger(VideoProcessingProcessor.name)

  constructor(
    private videoProcessingService: VideoProcessingService,
    private prisma: PrismaService,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>
  ) {}

  @Process("process-video")
  async handleVideoProcessing(job: Job<VideoProcessingJob>) {
    const { videoId } = job.data

    try {
      this.logger.log(`Processing video ${videoId}`)

      // Update video status to processing
      await this.videoModel.findByIdAndUpdate(videoId, {
        status: "PROCESSING",
      })

      // Process the video
      const result = await this.videoProcessingService.processVideo(job.data)

      // Update video with processed data
      await this.videoModel.findByIdAndUpdate(videoId, {
        status: "PUBLISHED",
        thumbnailUrl: result.thumbnailUrl,
        videoUrls: result.videoUrls,
        duration: result.metadata.duration,
        metadata: result.metadata,
      })

      this.logger.log(`Video ${videoId} processed successfully`)
      return result
    } catch (error) {
      this.logger.error(`Failed to process video ${videoId}:`, error)

      // Update video status to failed
      await this.videoModel.findByIdAndUpdate(videoId, {
        status: "FAILED",
        metadata: {
          error: error.message,
        },
      })

      throw error
    }
  }
}
