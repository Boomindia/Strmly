import { Injectable, Logger, Inject } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bull"
import type { Queue } from "bull"
import * as ffmpeg from "fluent-ffmpeg"
import * as path from "path"
import * as fs from "fs"
import { UploadService } from "../upload/upload.service"

export interface VideoProcessingJob {
  videoId: string
  inputUrl: string
  userId: string
  originalFilename: string
}

export interface VideoQuality {
  name: string
  width: number
  height: number
  bitrate: string
}

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name)

  private readonly qualities: VideoQuality[] = [
    { name: "360p", width: 640, height: 360, bitrate: "800k" },
    { name: "480p", width: 854, height: 480, bitrate: "1200k" },
    { name: "720p", width: 1280, height: 720, bitrate: "2500k" },
    { name: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
  ]

  constructor(
    @InjectQueue('video-processing') private videoQueue: Queue,
    private uploadService: UploadService
  ) {}

  async addVideoToProcessingQueue(jobData: VideoProcessingJob): Promise<void> {
    await this.videoQueue.add("process-video", jobData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    })
  }

  async processVideo(jobData: VideoProcessingJob): Promise<any> {
    const { videoId, inputUrl, userId, originalFilename } = jobData

    try {
      this.logger.log(`Starting video processing for video ${videoId}`)

      // Download video from S3 to temporary location
      const tempDir = path.join(process.cwd(), "temp")
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const inputPath = path.join(tempDir, `${videoId}_input.mp4`)
      await this.downloadFromS3(inputUrl, inputPath)

      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath)

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(inputPath, videoId)
      const thumbnailUrl = await this.uploadService.uploadFile(
        fs.createReadStream(thumbnailPath),
        "thumbnails",
        "image/jpeg"
      )

      // Process video in multiple qualities
      const processedVideos = await this.processMultipleQualities(inputPath, videoId)

      // Upload processed videos to S3
      const videoUrls = {}
      for (const [quality, filePath] of Object.entries(processedVideos)) {
        const videoUrl = await this.uploadService.uploadFile(
          fs.createReadStream(filePath),
          "videos",
          "video/mp4"
        )
        videoUrls[quality] = videoUrl
      }

      // Clean up temporary files
      this.cleanupTempFiles([inputPath, thumbnailPath, ...Object.values(processedVideos)])

      return {
        videoId,
        metadata,
        thumbnailUrl,
        videoUrls,
        status: "completed",
      }
    } catch (error) {
      this.logger.error(`Video processing failed for video ${videoId}:`, error)
      throw error
    }
  }

  private async downloadFromS3(url: string, outputPath: string): Promise<void> {
    // Implementation to download file from S3 URL
    // This would use AWS SDK to download the file
    return new Promise((resolve, reject) => {
      // Simplified implementation - in real scenario, use AWS SDK
      resolve()
    })
  }

  private async getVideoMetadata(inputPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          const videoStream = metadata.streams.find((stream) => stream.codec_type === "video")
          resolve({
            duration: metadata.format.duration,
            width: videoStream?.width,
            height: videoStream?.height,
            bitrate: metadata.format.bit_rate,
            size: metadata.format.size,
            format: metadata.format.format_name,
          })
        }
      })
    })
  }

  private async generateThumbnail(inputPath: string, videoId: string): Promise<string> {
    const thumbnailPath = path.join(process.cwd(), "temp", `${videoId}_thumbnail.jpg`)

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ["10%"],
          filename: `${videoId}_thumbnail.jpg`,
          folder: path.join(process.cwd(), "temp"),
          size: "1280x720",
        })
        .on("end", () => {
          resolve(thumbnailPath)
        })
        .on("error", (err) => {
          reject(err)
        })
    })
  }

  private async processMultipleQualities(inputPath: string, videoId: string): Promise<Record<string, string>> {
    const processedVideos: Record<string, string> = {}

    for (const quality of this.qualities) {
      const outputPath = path.join(process.cwd(), "temp", `${videoId}_${quality.name}.mp4`)

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .size(`${quality.width}x${quality.height}`)
          .videoBitrate(quality.bitrate)
          .audioCodec("aac")
          .videoCodec("libx264")
          .format("mp4")
          .output(outputPath)
          .on("end", () => {
            processedVideos[quality.name] = outputPath
            resolve(outputPath)
          })
          .on("error", (err) => {
            this.logger.error(`Failed to process ${quality.name} quality:`, err)
            reject(err)
          })
          .on("progress", (progress) => {
            this.logger.log(`Processing ${quality.name}: ${progress.percent}% done`)
          })
          .run()
      })
    }

    return processedVideos
  }

  private cleanupTempFiles(filePaths: string[]): void {
    filePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })
  }

  async getProcessingStatus(videoId: string): Promise<any> {
    const jobs = await this.videoQueue.getJobs(["active", "waiting", "completed", "failed"])
    const job = jobs.find((j) => j.data.videoId === videoId)

    if (!job) {
      return { status: "not_found" }
    }

    return {
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
    }
  }
}
