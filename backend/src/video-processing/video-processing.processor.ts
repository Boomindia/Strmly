import { Processor, Process } from "@nestjs/bull"
import type { Job } from "bull"
import { Logger } from "@nestjs/common"
import type { VideoProcessingService, VideoProcessingJob } from "./video-processing.service"
import type { PrismaService } from "../prisma/prisma.service"

@Processor("video-processing")
export class VideoProcessingProcessor {
  private readonly logger = new Logger(VideoProcessingProcessor.name)

  constructor(
    private videoProcessingService: VideoProcessingService,
    private prisma: PrismaService,
  ) {}

  @Process("process-video")
  async handleVideoProcessing(job: Job<VideoProcessingJob>) {
    const { videoId } = job.data

    try {
      this.logger.log(`Processing video ${videoId}`)

      // Update video status to processing
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: "PROCESSING" },
      })

      // Process the video
      const result = await this.videoProcessingService.processVideo(job.data)

      // Update video with processed data
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: "PUBLISHED",
          thumbnailUrl: result.thumbnailUrl,
          videoUrls: result.videoUrls,
          duration: result.metadata.duration,
          metadata: result.metadata,
        },
      })

      this.logger.log(`Video ${videoId} processed successfully`)
      return result
    } catch (error) {
      this.logger.error(`Failed to process video ${videoId}:`, error)

      // Update video status to failed
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED" },
      })

      throw error
    }
  }
}
