import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { Model } from "mongoose"
import type { VideoDocument } from "../schemas/video.schema"
import type { LikeDocument } from "../schemas/like.schema"
import type { CommentDocument } from "../schemas/comment.schema"
import type { FollowDocument } from "../schemas/follow.schema"
import type { ShareDocument } from "../schemas/share.schema"
import type { ViewDocument } from "../schemas/view.schema"
import type { TransactionDocument } from "../schemas/transaction.schema"

@Injectable()
export class DatabaseService {
  private videoModel: Model<VideoDocument>
  private likeModel: Model<LikeDocument>
  private commentModel: Model<CommentDocument>
  private followModel: Model<FollowDocument>
  private shareModel: Model<ShareDocument>
  private viewModel: Model<ViewDocument>
  private transactionModel: Model<TransactionDocument>

  constructor(private prisma: PrismaService) {
    this.videoModel = null
    this.likeModel = null
    this.commentModel = null
    this.followModel = null
    this.shareModel = null
    this.viewModel = null
    this.transactionModel = null
  }

  // User operations (PostgreSQL)
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCommunities: true,
        communityMembers: {
          include: {
            community: true,
          },
        },
      },
    })
  }

  async getUserWithStats(userId: string) {
    const user = await this.getUserById(userId)
    if (!user) return null

    // Get stats from MongoDB
    const [videosCount, followersCount, followingCount] = await Promise.all([
      this.videoModel.countDocuments({ userId, status: "PUBLISHED" }),
      this.followModel.countDocuments({ followingId: userId }),
      this.followModel.countDocuments({ followerId: userId }),
    ])

    return {
      ...user,
      stats: {
        videosCount,
        followersCount,
        followingCount,
      },
    }
  }

  // Video operations (MongoDB with PostgreSQL user data)
  async getVideoWithUserData(videoId: string, currentUserId?: string) {
    const video = await this.videoModel.findById(videoId)
    if (!video) return null

    // Get user data from PostgreSQL
    const user = await this.prisma.user.findUnique({
      where: { id: video.userId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    // Get community data if exists
    let community = null
    if (video.communityId) {
      community = await this.prisma.community.findUnique({
        where: { id: video.communityId },
      })
    }

    // Check if current user liked the video
    let isLiked = false
    if (currentUserId) {
      const like = await this.likeModel.findOne({
        userId: currentUserId,
        videoId: videoId,
        targetType: "VIDEO",
      })
      isLiked = !!like
    }

    return {
      ...video.toObject(),
      user,
      community,
      isLiked,
    }
  }

  async getVideoFeed(currentUserId: string, page = 1, limit = 10, type?: string) {
    const skip = (page - 1) * limit

    const query: any = { status: "PUBLISHED" }
    if (type) {
      query.type = type
    }

    const videos = await this.videoModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get user data for all videos
    const userIds = [...new Set(videos.map((v) => v.userId))]
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Get community data
    const communityIds = videos.map((v) => v.communityId).filter(Boolean) as string[]

    const communities = await this.prisma.community.findMany({
      where: { id: { in: communityIds } },
    })

    const communityMap = new Map(communities.map((c) => [c.id, c]))

    // Check likes for current user
    const videoIds = videos.map((v) => v._id.toString())
    const likes = await this.likeModel.find({
      userId: currentUserId,
      videoId: { $in: videoIds },
      targetType: "VIDEO",
    })

    const likedVideoIds = new Set(likes.map((l) => l.videoId))

    return videos.map((video) => ({
      ...video,
      user: userMap.get(video.userId),
      community: video.communityId ? communityMap.get(video.communityId) : null,
      isLiked: likedVideoIds.has(video._id.toString()),
    }))
  }

  // Like operations
  async toggleVideoLike(userId: string, videoId: string) {
    const existingLike = await this.likeModel.findOne({
      userId,
      videoId,
      targetType: "VIDEO",
    })

    if (existingLike) {
      // Unlike
      await this.likeModel.deleteOne({ _id: existingLike._id })
      await this.videoModel.updateOne({ _id: videoId }, { $inc: { likesCount: -1 } })
      return { liked: false }
    } else {
      // Like
      await this.likeModel.create({
        userId,
        videoId,
        targetType: "VIDEO",
      })
      await this.videoModel.updateOne({ _id: videoId }, { $inc: { likesCount: 1 } })
      return { liked: true }
    }
  }

  // Follow operations
  async toggleFollow(followerId: string, followingId: string) {
    const existingFollow = await this.followModel.findOne({
      followerId,
      followingId,
    })

    if (existingFollow) {
      // Unfollow
      await this.followModel.deleteOne({ _id: existingFollow._id })
      return { following: false }
    } else {
      // Follow
      await this.followModel.create({
        followerId,
        followingId,
      })
      return { following: true }
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel.findOne({
      followerId,
      followingId,
    })
    return !!follow
  }

  // Comment operations
  async createComment(userId: string, videoId: string, content: string, parentId?: string) {
    const comment = await this.commentModel.create({
      userId,
      videoId,
      content,
      parentId,
    })

    // Update video comments count
    await this.videoModel.updateOne({ _id: videoId }, { $inc: { commentsCount: 1 } })

    // Update parent comment replies count if it's a reply
    if (parentId) {
      await this.commentModel.updateOne({ _id: parentId }, { $inc: { repliesCount: 1 } })
    }

    return comment
  }

  async getVideoComments(videoId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const comments = await this.commentModel
      .find({ videoId, parentId: { $exists: false } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get user data for comments
    const userIds = [...new Set(comments.map((c) => c.userId))]
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return comments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.userId),
    }))
  }

  // View tracking
  async trackVideoView(userId: string, videoId: string, duration?: number, watchPercentage?: number) {
    await this.viewModel.create({
      userId,
      videoId,
      duration,
      watchPercentage,
    })

    // Update video views count
    await this.videoModel.updateOne({ _id: videoId }, { $inc: { viewsCount: 1 } })
  }

  // Share operations
  async shareVideo(userId: string, videoId: string, platform?: string) {
    await this.shareModel.create({
      userId,
      videoId,
      platform,
    })

    // Update video shares count
    await this.videoModel.updateOne({ _id: videoId }, { $inc: { sharesCount: 1 } })
  }

  // Transaction operations
  async createTransaction(userId: string, type: string, amount: number, description: string, metadata?: any) {
    return this.transactionModel.create({
      userId,
      type,
      amount,
      description,
      metadata,
    })
  }

  async getUserTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    return this.transactionModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
  }

  // Analytics operations
  async getVideoAnalytics(videoId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [views, likes, comments, shares] = await Promise.all([
      this.viewModel.countDocuments({ videoId, createdAt: { $gte: startDate } }),
      this.likeModel.countDocuments({ videoId, targetType: "VIDEO", createdAt: { $gte: startDate } }),
      this.commentModel.countDocuments({ videoId, createdAt: { $gte: startDate } }),
      this.shareModel.countDocuments({ videoId, createdAt: { $gte: startDate } }),
    ])

    return { views, likes, comments, shares }
  }

  async getUserAnalytics(userId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const userVideos = await this.videoModel.find({ userId }, "_id")
    const videoIds = userVideos.map((v) => v._id.toString())

    const [totalViews, totalLikes, totalComments, totalShares, newFollowers] = await Promise.all([
      this.viewModel.countDocuments({ videoId: { $in: videoIds }, createdAt: { $gte: startDate } }),
      this.likeModel.countDocuments({
        videoId: { $in: videoIds },
        targetType: "VIDEO",
        createdAt: { $gte: startDate },
      }),
      this.commentModel.countDocuments({ videoId: { $in: videoIds }, createdAt: { $gte: startDate } }),
      this.shareModel.countDocuments({ videoId: { $in: videoIds }, createdAt: { $gte: startDate } }),
      this.followModel.countDocuments({ followingId: userId, createdAt: { $gte: startDate } }),
    ])

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      newFollowers,
    }
  }

  // Add these methods to the DatabaseService class

  async getUserFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const follows = await this.followModel
      .find({ followingId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get user data from PostgreSQL
    const userIds = follows.map((f) => f.followerId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
        bio: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return {
      followers: follows.map((follow) => userMap.get(follow.followerId)).filter(Boolean),
      total: await this.followModel.countDocuments({ followingId: userId }),
      page,
      limit,
    }
  }

  async getUserFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const follows = await this.followModel
      .find({ followerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get user data from PostgreSQL
    const userIds = follows.map((f) => f.followingId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
        bio: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return {
      following: follows.map((follow) => userMap.get(follow.followingId)).filter(Boolean),
      total: await this.followModel.countDocuments({ followerId: userId }),
      page,
      limit,
    }
  }

  async getUserVideos(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const videos = await this.videoModel
      .find({ userId, status: "PUBLISHED" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get user data from PostgreSQL
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    return {
      videos: videos.map((video) => ({
        ...video,
        user,
      })),
      total: await this.videoModel.countDocuments({ userId, status: "PUBLISHED" }),
      page,
      limit,
    }
  }

  // Add method to inject models (call this in constructor)
  setModels(models: any) {
    this.videoModel = models.videoModel
    this.likeModel = models.likeModel
    this.commentModel = models.commentModel
    this.followModel = models.followModel
    this.shareModel = models.shareModel
    this.viewModel = models.viewModel
    this.transactionModel = models.transactionModel
  }
}