import { Injectable, NotFoundException, ForbiddenException, Logger } from "@nestjs/common"
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
  private readonly logger = new Logger(VideosService.name)

  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private databaseService: DatabaseService,
    private uploadService: UploadService,
    private videoProcessingService: VideoProcessingService,
    private cacheService: CacheService,
  ) {}

  async createVideo(userId: string, file: Express.Multer.File, createVideoDto: CreateVideoDto): Promise<Video> {
    let videoUrl: string | undefined;
    try {
      // Upload to S3
      videoUrl = await this.uploadService.uploadFile(file, "videos", "video/mp4");
      
      // Create video document with PUBLISHED status
      const video = await this.videoModel.create({
        title: createVideoDto.title,
        description: createVideoDto.description,
        type: createVideoDto.type || "LONG",
        status: "PUBLISHED",
        videoUrl: videoUrl,
        userId: userId,
        visibility: createVideoDto.visibility || "PUBLIC",
        duration: 0, // We'll update this later if needed
        thumbnailUrl: "", // We'll update this later if needed
        tags: createVideoDto.tags || [],
        category: createVideoDto.genre || "OTHER",
        language: "en",
        monetization: {
          isMonetized: false,
          type: "NONE"
        },
        ageRestriction: createVideoDto.ageRestriction || "all",
        orientation: createVideoDto.orientation || "landscape",
        communityId: createVideoDto.communityId,
        seriesId: createVideoDto.seriesId,
        episodeNumber: createVideoDto.episodeNumber,
        newSeriesName: createVideoDto.newSeriesName,
        newSeriesDescription: createVideoDto.newSeriesDescription,
        totalEpisodes: createVideoDto.totalEpisodes
      });

      return video;
    } catch (error) {
      this.logger.error(`Error in createVideo: ${error}`);
      // Clean up uploaded file if document creation fails
      if (error.message.includes("Failed to create video document") && videoUrl) {
        await this.uploadService.deleteFileFromS3(videoUrl);
      }
      throw error;
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

  async toggleCommentLike(userId: string, videoId: string, commentId: string) {
    return this.databaseService.toggleCommentLike(userId, videoId, commentId)
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

