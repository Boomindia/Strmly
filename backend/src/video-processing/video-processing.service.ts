import { Injectable, Logger, Inject } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bull"
import type { Queue } from "bull"
import * as ffmpeg from "fluent-ffmpeg"
import * as path from "path"
import * as fs from "fs"
import { UploadService } from "../upload/upload.service"
import { Readable } from "stream"
import type { Express } from "express"

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
    try {
      await this.videoQueue.add("process-video", jobData, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 30000 // 30 seconds timeout
      });
      this.logger.log(`Added video ${jobData.videoId} to processing queue`);
    } catch (error) {
      this.logger.error(`Failed to add video ${jobData.videoId} to processing queue:`, error);
      throw new Error(`Failed to add video to processing queue: ${error.message}`);
    }
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
      this.logger.log(`Video metadata: ${JSON.stringify(metadata)}`)

      // Generate thumbnail
      this.logger.log(`Generating thumbnail for video ${videoId}`)
      const thumbnailPath = await this.generateThumbnail(inputPath, videoId)
      const thumbnailUrl = await this.uploadThumbnail(thumbnailPath)
      this.logger.log(`Thumbnail uploaded: ${thumbnailUrl}`)

      // Process video in multiple qualities
      this.logger.log(`Processing video ${videoId} in multiple qualities`)
      const processedVideos = await this.processMultipleQualities(inputPath, videoId)

      // Upload processed videos to S3
      this.logger.log(`Uploading processed videos for ${videoId}`)
      const videoUrls = {}
      for (const [quality, filePath] of Object.entries(processedVideos)) {
        const videoUrl = await this.uploadProcessedVideo(filePath)
        videoUrls[quality] = videoUrl
        this.logger.log(`Uploaded ${quality} quality: ${videoUrl}`)
      }

      // Clean up temporary files
      this.cleanupTempFiles([inputPath, thumbnailPath, ...Object.values(processedVideos)])

      this.logger.log(`Video processing completed for ${videoId}`)
      return {
        videoId,
        metadata,
        thumbnailUrl,
        videoUrls,
        status: "completed",
      }
    } catch (error) {
      this.logger.error(`Video processing failed for video ${videoId}:`, error)
      // Clean up any temporary files that might have been created
      const tempDir = path.join(process.cwd(), "temp")
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir)
        files.forEach(file => {
          if (file.includes(videoId)) {
            fs.unlinkSync(path.join(tempDir, file))
          }
        })
      }
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

  async uploadThumbnail(thumbnailPath: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(thumbnailPath);
      const fileBuffer = await this.streamToBuffer(fileStream);
      
      const file: Express.Multer.File = {
        fieldname: 'thumbnail',
        originalname: 'thumbnail.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: fileBuffer,
        size: fileBuffer.length,
        destination: '',
        filename: '',
        path: '',
        stream: Readable.from(fileBuffer)
      };

      return await this.uploadService.uploadFile(file, "thumbnails", "image/jpeg");
    } catch (error) {
      this.logger.error(`Failed to upload thumbnail: ${error.message}`);
      throw error;
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async uploadProcessedVideo(filePath: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);
      const fileBuffer = await this.streamToBuffer(fileStream);
      
      const file: Express.Multer.File = {
        fieldname: 'video',
        originalname: path.basename(filePath),
        encoding: '7bit',
        mimetype: 'video/mp4',
        buffer: fileBuffer,
        size: fileBuffer.length,
        destination: '',
        filename: '',
        path: '',
        stream: Readable.from(fileBuffer)
      };

      return await this.uploadService.uploadFile(file, "processed-videos", "video/mp4");
    } catch (error) {
      this.logger.error(`Failed to upload processed video: ${error.message}`);
      throw error;
    }
  }
}
