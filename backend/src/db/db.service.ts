import { Injectable, Inject } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { PrismaService } from "../prisma/prisma.service"
import type { Model } from "mongoose"
import type { VideoDocument } from "../schemas/video.schema"
import type { LikeDocument } from "../schemas/like.schema"
import type { CommentDocument } from "../schemas/comment.schema"
import type { FollowDocument } from "../schemas/follow.schema"
import type { ShareDocument } from "../schemas/share.schema"
import type { ViewDocument } from "../schemas/view.schema"
import type { TransactionDocument } from "../schemas/transaction.schema"
import { Video } from "../schemas/video.schema"
import { Like } from "../schemas/like.schema"
import { Comment } from "../schemas/comment.schema"
import { Follow } from "../schemas/follow.schema"
import { Share } from "../schemas/share.schema"
import { View } from "../schemas/view.schema"
import { Transaction } from "../schemas/transaction.schema"

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Share.name) private shareModel: Model<ShareDocument>,
    @InjectModel(View.name) private viewModel: Model<ViewDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

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
    let community: any = null
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

  async toggleCommentLike(userId: string, videoId: string, commentId: string) {
    const existingLike = await this.likeModel.findOne({
      userId,
      videoId,
      targetType: "COMMENT",
      targetId: commentId,
    })

    if (existingLike) {
      // Unlike
      await this.likeModel.deleteOne({ _id: existingLike._id })
      await this.commentModel.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } })
      return { liked: false }
    } else {
      // Like
      await this.likeModel.create({
        userId,
        videoId,
        targetType: "COMMENT",
        targetId: commentId,
      })
      await this.commentModel.updateOne({ _id: commentId }, { $inc: { likesCount: 1 } })
      return { liked: true }
    }
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

    // Get likes for current user
    const commentIds = comments.map((c) => c._id.toString())
    const likes = await this.likeModel.find({
      videoId,
      targetType: "COMMENT",
      targetId: { $in: commentIds },
    })

    const likedCommentIds = new Set(likes.map((l) => l.targetId))

    return comments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.userId) || {
        id: comment.userId,
        name: "Anonymous User",
        username: "@anonymous",
        avatar: "/placeholder.svg",
        isVerified: false,
      },
      isLiked: likedCommentIds.has(comment._id.toString()),
    }))
  }

  // View operations
  async trackVideoView(userId: string, videoId: string, duration?: number, watchPercentage?: number) {
    await this.viewModel.create({
      userId,
      videoId,
      duration,
      watchPercentage,
    })

    await this.videoModel.updateOne({ _id: videoId }, { $inc: { viewsCount: 1 } })
  }

  // Share operations
  async shareVideo(userId: string, videoId: string, platform?: string) {
    await this.shareModel.create({
      userId,
      videoId,
      platform,
    })

    await this.videoModel.updateOne({ _id: videoId }, { $inc: { sharesCount: 1 } })
  }

  // Transaction operations (MongoDB)
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
      this.viewModel.aggregate([
        { $match: { videoId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.likeModel.aggregate([
        { $match: { videoId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.commentModel.aggregate([
        { $match: { videoId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.shareModel.aggregate([
        { $match: { videoId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
    ])

    return {
      views,
      likes,
      comments,
      shares,
    }
  }

  // User analytics
  async getUserAnalytics(userId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [videos, followers, views, likes] = await Promise.all([
      this.videoModel.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.followModel.aggregate([
        { $match: { followingId: userId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.viewModel.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
      this.likeModel.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ]),
    ])

    return {
      videos,
      followers,
      views,
      likes,
    }
  }

  // User followers/following
  async getUserFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const follows = await this.followModel
      .find({ followingId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const followerIds = follows.map((f) => f.followerId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: followerIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return follows.map((follow) => ({
      ...follow,
      user: userMap.get(follow.followerId),
    }))
  }

  async getUserFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const follows = await this.followModel
      .find({ followerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const followingIds = follows.map((f) => f.followingId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: followingIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return follows.map((follow) => ({
      ...follow,
      user: userMap.get(follow.followingId),
    }))
  }

  // User videos
  async getUserVideos(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const videos = await this.videoModel
      .find({ userId, status: "PUBLISHED" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get user data
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

    // Get community data
    const communityIds = videos.map((v) => v.communityId).filter(Boolean) as string[]
    const communities = await this.prisma.community.findMany({
      where: { id: { in: communityIds } },
    })

    const communityMap = new Map(communities.map((c) => [c.id, c]))

    return videos.map((video) => ({
      ...video,
      user,
      community: video.communityId ? communityMap.get(video.communityId) : null,
    }))
  }

  async getCommunityWithMembers(communityId: string): Promise<any | null> {
    const community: any = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!community) {
      return null
    }

    return community
  }
}