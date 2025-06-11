import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Video } from "../schemas/video.schema"
import type { VideoDocument } from "../schemas/video.schema"
import { DatabaseService } from "../db/db.service"
import { UploadService } from "../upload/upload.service"
import { VideoProcessingService } from "../video-processing/video-processing.service"
import { CacheService } from "../cache/cache.service"
import type { CreateVideoDto, UpdateVideoDto } from "./dto/video.dto"

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private databaseService: DatabaseService,
    private uploadService: UploadService,
    private videoProcessingService: VideoProcessingService,
    private cacheService: CacheService,
  ) {}

  async createVideo(userId: string, files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }) {
    const videoFile = files.video?.[0]
    const thumbnailFile = files.thumbnail?.[0]

    if (!videoFile) {
      throw new Error("Video file is required")
    }

    let videoUrl: string | undefined
    let thumbnailUrl: string | undefined

    try {
      // Upload video and thumbnail
      videoUrl = await this.uploadService.uploadFile(videoFile, "videos", "video/mp4")
      if (thumbnailFile) {
        thumbnailUrl = await this.uploadService.uploadFile(thumbnailFile, "thumbnails", "image/jpeg")
      }

      // Create video document
      const video = await this.videoModel.create({
        userId,
        videoPath: videoFile.path,
        thumbnail: thumbnailFile?.path,
        thumbnailUrl,
        videoUrl,
        status: "PENDING",
      })

      // Add to processing queue
      await this.videoProcessingService.addVideoToProcessingQueue({
        videoId: (video as any)._id.toString(),
        inputUrl: videoFile.path,
        userId,
        originalFilename: videoFile.originalname,
      })

      // Get video with user data
      const videoWithUserData = await this.databaseService.getVideoWithUserData((video as any)._id.toString())

      // Cache video data
      await this.cacheService.cacheVideoData((video as any)._id.toString(), videoWithUserData)

      return videoWithUserData
    } catch (error) {
      // Clean up uploaded files if creation fails
      if (videoUrl) {
        await this.uploadService.deleteFileFromS3(videoUrl)
      }
      if (thumbnailUrl) {
        await this.uploadService.deleteFileFromS3(thumbnailUrl)
      }
      throw error
    }
  }

  async getVideo(videoId: string, userId?: string) {
    // Try to get from cache first
    let video = await this.cacheService.getCachedVideoData(videoId)

    if (!video) {
      // Get from database if not in cache
      video = await this.databaseService.getVideoWithUserData(videoId, userId)

      if (video) {
        // Cache video data
        await this.cacheService.cacheVideoData(videoId, video)
      }
    }

    return video
  }

  async getVideoFeed(userId: string, page = 1, limit = 10, type?: string) {
    return this.databaseService.getVideoFeed(userId, page, limit, type)
  }

  async updateVideo(videoId: string, userId: string, updateData: Partial<VideoDocument>) {
    const video = await this.videoModel.findOne({ _id: videoId, userId })
    if (!video) {
      throw new Error("Video not found")
    }

    // Update video
    const updatedVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      { $set: updateData },
      { new: true },
    )

    // Get video with user data
    const videoWithUserData = await this.databaseService.getVideoWithUserData(videoId, userId)

    // Update cache
    await this.cacheService.cacheVideoData(videoId, videoWithUserData)

    return videoWithUserData
  }

  async deleteVideo(videoId: string, userId: string) {
    const video = await this.videoModel.findOne({ _id: videoId, userId })
    if (!video) {
      throw new Error("Video not found")
    }

    // Delete video file
    if (video.videoUrl) {
      await this.uploadService.deleteFileFromS3(video.videoUrl)
    }

    // Delete thumbnail
    if (video.thumbnailUrl) {
      await this.uploadService.deleteFileFromS3(video.thumbnailUrl)
    }

    // Delete video document
    await this.videoModel.deleteOne({ _id: videoId })

    // Delete from cache
    await this.cacheService.del(`video:${videoId}`)

    return { success: true }
  }

  async toggleLike(userId: string, videoId: string) {
    return this.databaseService.toggleVideoLike(userId, videoId)
  }

  async addComment(userId: string, videoId: string, content: string, parentId?: string) {
    return this.databaseService.createComment(userId, videoId, content, parentId)
  }

  async getComments(videoId: string, page = 1, limit = 20) {
    return this.databaseService.getVideoComments(videoId, page, limit)
  }

  async shareVideo(userId: string, videoId: string, platform?: string) {
    await this.databaseService.shareVideo(userId, videoId, platform)
  }

  async trackView(userId: string, videoId: string) {
    const recentView = await this.cacheService.get(`view:${userId}:${videoId}`)

    if (!recentView) {
      await this.databaseService.trackVideoView(userId, videoId)
      await this.cacheService.set(`view:${userId}:${videoId}`, true, 3600) // Cache for 1 hour
    }
  }

  async getVideoAnalytics(videoId: string, userId: string) {
    return this.databaseService.getVideoAnalytics(videoId, Number(userId))
  }

  async getTrendingVideos(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const videos = await this.videoModel
      .find({ status: "PUBLISHED" })
      .sort({ views: -1, likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await this.videoModel.countDocuments({ status: "PUBLISHED" })

    const videosWithUserData = await Promise.all(
      videos.map((video) => this.databaseService.getVideoWithUserData((video as any)._id.toString()))
    )

    return {
      videos: videosWithUserData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}

