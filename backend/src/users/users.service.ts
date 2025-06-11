import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { DatabaseService } from "../db/db.service"
import type { CacheService } from "../cache/cache.service"
import type { UploadService } from "../upload/upload.service"
import type { CreateUserDto } from "./dto/user.dto"
import type { UpdateProfileDto } from "./dto/update-profile.dto"
import type { Express } from "express"

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private uploadService: UploadService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: createUserDto.phoneNumber },
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    })

    if (existingUser) {
      throw new ConflictException("User already exists")
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
    })

    return user
  }

  async getUserProfile(userId: string) {
    // Try cache first
    let user = await this.cacheService.getCachedUserProfile(userId)

    if (!user) {
      user = await this.databaseService.getUserWithStats(userId)

      if (!user) {
        throw new NotFoundException("User not found")
      }

      // Cache user profile
      await this.cacheService.cacheUserProfile(userId, user)
    }

    return user
  }

  async getUserByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        ownedCommunities: true,
        communityMembers: {
          include: {
            community: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Get stats from MongoDB
    const userWithStats = await this.databaseService.getUserWithStats(user.id)

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId) {
      isFollowing = await this.databaseService.isFollowing(currentUserId, user.id)
    }

    return {
      ...userWithStats,
      isFollowing,
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, avatarFile?: Express.Multer.File) {
    const { username, ...otherData } = updateProfileDto

    // Check if username is being updated and if it's available
    if (username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      })

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException("Username already taken")
      }
    }

    let avatarUrl = undefined
    if (avatarFile) {
      avatarUrl = await this.uploadService.uploadImage(avatarFile, "avatars")
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    })

    // Invalidate cache
    await this.cacheService.invalidateUserProfile(userId)

    return this.databaseService.getUserWithStats(userId)
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException("You cannot follow yourself")
    }

    // Check if both users exist
    const [follower, following] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followingId } }),
    ])

    if (!follower || !following) {
      throw new NotFoundException("User not found")
    }

    const result = await this.databaseService.toggleFollow(followerId, followingId)

    // Invalidate user caches
    await Promise.all([
      this.cacheService.invalidateUserProfile(followerId),
      this.cacheService.invalidateUserProfile(followingId),
    ])

    return result
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    return this.databaseService.getUserFollowers(userId, page, limit)
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    return this.databaseService.getUserFollowing(userId, page, limit)
  }

  async getUserVideos(userId: string, page = 1, limit = 20) {
    return this.databaseService.getUserVideos(userId, page, limit)
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
        bio: true,
      },
      skip,
      take: limit,
    })

    // Get stats for each user from MongoDB
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await this.databaseService.getUserWithStats(user.id)
        return {
          ...user,
          stats: stats?.stats || { videosCount: 0, followersCount: 0, followingCount: 0 },
        }
      }),
    )

    return usersWithStats
  }

  async getUserAnalytics(userId: string, days = 30) {
    return this.databaseService.getUserAnalytics(userId, days)
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.databaseService.isFollowing(followerId, followingId)
  }
}
