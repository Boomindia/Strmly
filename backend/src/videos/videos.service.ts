import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import type { Model } from "mongoose"
import type { DatabaseService } from "../db/db.service"
import type { CacheService } from "../cache/cache.service"
import type { VideoProcessingService } from "../video-processing/video-processing.service"
import type { UploadService } from "../upload/upload.service"
import type { VideoDocument } from "../schemas/video.schema"
import type { CreateVideoDto, UpdateVideoDto } from "./dto/video.dto"

@Injectable()
export class VideosService {
  private videoModel: Model<VideoDocument>

  constructor(
    databaseService: DatabaseService,
    cacheService: CacheService,
    videoProcessingService: VideoProcessingService,
    uploadService: UploadService,
  ) {
    this.videoModel = databaseService.getVideoModel()
  }

  async createVideo(userId: string, createVideoDto: CreateVideoDto, files?: any) {
    let videoUrl = ""
    let thumbnailUrl = ""

    if (files?.video?.[0]) {
      // Upload original video to S3
      videoUrl = await this.uploadService.uploadVideo(files.video[0], `videos/${userId}`)
    }

    if (files?.thumbnail?.[0]) {
      // Upload thumbnail to S3
      thumbnailUrl = await this.uploadService.uploadImage(files.thumbnail[0], `thumbnails`)
    }

    // Create video record in MongoDB
    const video = await this.videoModel.create({
      ...createVideoDto,
      userId,
      videoUrl,
      thumbnailUrl,
      status: files?.video?.[0] ? "PROCESSING" : "DRAFT",
    })

    // If video file was uploaded, start processing
    if (files?.video?.[0]) {
      await this.videoProcessingService.addVideoToProcessingQueue({
        videoId: video._id.toString(),
        inputUrl: videoUrl,
        userId,
        originalFilename: files.video[0].originalname,
      })
    }

    // Get video with user data
    const videoWithUserData = await this.databaseService.getVideoWithUserData(video._id.toString())

    // Cache the video data
    await this.cacheService.cacheVideoData(video._id.toString(), videoWithUserData)

    return videoWithUserData
  }

  async getVideoById(videoId: string, userId?: string) {
    // Try to get from cache first
    let video = await this.cacheService.getCachedVideoData(videoId)

    if (!video) {
      video = await this.databaseService.getVideoWithUserData(videoId, userId)

      if (!video) {
        throw new NotFoundException("Video not found")
      }

      // Cache the video data
      await this.cacheService.cacheVideoData(videoId, video)
    }

    // Track view if user is provided
    if (userId) {
      await this.trackVideoView(videoId, userId)
    }

    return video
  }

  async getVideoFeed(userId: string, page = 1, limit = 10, type?: "SHORT" | "LONG") {
    return this.databaseService.getVideoFeed(userId, page, limit, type)
  }

  async updateVideo(videoId: string, userId: string, updateVideoDto: UpdateVideoDto) {
    const video = await this.videoModel.findById(videoId)

    if (!video) {
      throw new NotFoundException("Video not found")
    }

    if (video.userId !== userId) {
      throw new ForbiddenException("You can only update your own videos")
    }

    const updatedVideo = await this.videoModel.findByIdAndUpdate(videoId, updateVideoDto, { new: true })

    // Get updated video with user data
    const videoWithUserData = await this.databaseService.getVideoWithUserData(videoId, userId)

    // Update cache
    await this.cacheService.cacheVideoData(videoId, videoWithUserData)

    return videoWithUserData
  }

  async deleteVideo(videoId: string, userId: string) {
    const video = await this.videoModel.findById(videoId)

    if (!video) {
      throw new NotFoundException("Video not found")
    }

    if (video.userId !== userId) {
      throw new ForbiddenException("You can only delete your own videos")
    }

    // Delete video files from S3
    if (video.videoUrl) {
      const videoKey = video.videoUrl.split("/").slice(-2).join("/")
      await this.uploadService.deleteFileFromS3(videoKey)
    }

    if (video.thumbnailUrl) {
      const thumbnailKey = video.thumbnailUrl.split("/").slice(-2).join("/")
      await this.uploadService.deleteFileFromS3(thumbnailKey)
    }

    // Delete from MongoDB
    await this.videoModel.findByIdAndDelete(videoId)

    // Remove from cache
    await this.cacheService.del(`video:${videoId}`)

    return { message: "Video deleted successfully" }
  }

  async likeVideo(videoId: string, userId: string) {
    return this.databaseService.toggleVideoLike(userId, videoId)
  }

  async addComment(videoId: string, userId: string, content: string, parentId?: string) {
    return this.databaseService.createComment(userId, videoId, content, parentId)
  }

  async getVideoComments(videoId: string, page = 1, limit = 20) {
    return this.databaseService.getVideoComments(videoId, page, limit)
  }

  async shareVideo(videoId: string, userId: string, platform?: string) {
    await this.databaseService.shareVideo(userId, videoId, platform)
    return { message: "Video shared successfully" }
  }

  private async trackVideoView(videoId: string, userId: string) {
    // Check if user has already viewed this video recently (within 1 hour)
    const recentView = await this.cacheService.get(`view:${userId}:${videoId}`)

    if (!recentView) {
      // Record the view
      await this.databaseService.trackVideoView(userId, videoId)

      // Cache the view to prevent duplicate counting
      await this.cacheService.set(`view:${userId}:${videoId}`, true, 3600)
    }
  }

  async getVideoAnalytics(videoId: string, userId: string, days = 30) {
    const video = await this.videoModel.findById(videoId)

    if (!video || video.userId !== userId) {
      throw new ForbiddenException("Access denied")
    }

    return this.databaseService.getVideoAnalytics(videoId, days)
  }

  async getTrendingVideos(limit = 20) {
    const cacheKey = `trending_videos:${limit}`
    let trendingVideos = await this.cacheService.get(cacheKey)

    if (!trendingVideos) {
      // Calculate trending based on recent engagement
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const videos = await this.videoModel
        .find({
          status: "PUBLISHED",
          createdAt: { $gte: sevenDaysAgo },
        })
        .sort({ likesCount: -1, viewsCount: -1, commentsCount: -1 })
        .limit(limit)
        .lean()

      // Get user data for trending videos
      const videoIds = videos.map((v) => v._id.toString())
      trendingVideos = await Promise.all(videoIds.map((id) => this.databaseService.getVideoWithUserData(id)))

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, trendingVideos, 3600)
    }

    return trendingVideos
  }
}
