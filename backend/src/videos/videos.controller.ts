import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { VideosService } from "./videos.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { CreateVideoDto, UpdateVideoDto, AddCommentDto } from "./dto/video.dto"

@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
  )
  async createVideo(
    req,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles() files: any,
  ) {
    return this.videosService.createVideo(req.user.id, createVideoDto, files)
  }

  @Get("feed")
  @UseGuards(JwtAuthGuard)
  async getVideoFeed(
    req,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("type") type?: "SHORT" | "LONG",
  ) {
    return this.videosService.getVideoFeed(req.user.id, Number(page), Number(limit), type)
  }

  @Get("trending")
  async getTrendingVideos(@Query("limit") limit = 20) {
    return this.videosService.getTrendingVideos(Number(limit))
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getVideoById(@Param("id") id: string, req) {
    return this.videosService.getVideoById(id, req.user?.id)
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async updateVideo(
    @Param("id") id: string,
    req,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    return this.videosService.updateVideo(id, req.user.id, updateVideoDto)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteVideo(@Param("id") id: string, req) {
    return this.videosService.deleteVideo(id, req.user.id)
  }

  @Post(":id/like")
  @UseGuards(JwtAuthGuard)
  async likeVideo(@Param("id") id: string, req) {
    return this.videosService.likeVideo(id, req.user.id)
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  async addComment(@Param("id") id: string, req, @Body() addCommentDto: AddCommentDto) {
    return this.videosService.addComment(id, req.user.id, addCommentDto.content, addCommentDto.parentId)
  }

  @Get(":id/comments")
  async getVideoComments(
    @Param("id") id: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.videosService.getVideoComments(id, Number(page), Number(limit))
  }

  @Post(":id/share")
  @UseGuards(JwtAuthGuard)
  async shareVideo(@Param("id") id: string, req, @Body() body: { platform?: string }) {
    return this.videosService.shareVideo(id, req.user.id, body.platform)
  }
}
