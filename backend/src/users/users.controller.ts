import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import type { UsersService } from "./users.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { UpdateProfileDto } from "./dto/update-profile.dto"
import type { Express } from "express"

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  async getProfile(req: any) {
    return this.usersService.getUserProfile(req.user.id)
  }

  @Put("profile")
  @UseInterceptors(FileInterceptor("avatar"))
  async updateProfile(
    req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto, avatarFile)
  }

  @Get(":username")
  async getUserByUsername(@Param("username") username: string, req: any) {
    return this.usersService.getUserByUsername(username, req.user?.id)
  }

  @Post(":userId/follow")
  async followUser(@Param("userId") userId: string, req: any) {
    return this.usersService.followUser(req.user.id, userId)
  }

  @Get(":userId/followers")
  async getFollowers(@Param("userId") userId: string, @Query("page") page = 1, @Query("limit") limit = 20) {
    return this.usersService.getFollowers(userId, Number(page), Number(limit))
  }

  @Get(":userId/following")
  async getFollowing(@Param("userId") userId: string, @Query("page") page = 1, @Query("limit") limit = 20) {
    return this.usersService.getFollowing(userId, Number(page), Number(limit))
  }

  @Get(":userId/videos")
  async getUserVideos(@Param("userId") userId: string, @Query("page") page = 1, @Query("limit") limit = 20) {
    return this.usersService.getUserVideos(userId, Number(page), Number(limit))
  }

  @Get("search")
  async searchUsers(@Query("q") query: string, @Query("page") page = 1, @Query("limit") limit = 20) {
    return this.usersService.searchUsers(query, Number(page), Number(limit))
  }

  @Get(":userId/analytics")
  async getUserAnalytics(@Param("userId") userId: string, @Query("days") days = 30) {
    return this.usersService.getUserAnalytics(userId, Number(days))
  }

  @Get(":userId/is-following/:targetUserId")
  async isFollowing(@Param("userId") userId: string, @Param("targetUserId") targetUserId: string) {
    return this.usersService.isFollowing(userId, targetUserId)
  }
}
