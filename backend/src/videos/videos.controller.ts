import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFiles, UploadedFile } from "@nestjs/common"
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { VideosService } from "./videos.service"
import { CreateVideoDto, UpdateVideoDto, AddCommentDto } from "./dto/video.dto"
import { RequestWithUser } from "../auth/interfaces/request.interface"

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  createVideo(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    console.log('Received file:', file);
    console.log('File details:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'Buffer present' : 'No buffer'
    });
    console.log('Received body:', body);

    // Parse tags if they exist
    let tags = [];
    if (body.tags) {
      try {
        tags = JSON.parse(body.tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }

    const createVideoDto: CreateVideoDto = {
      title: body.title,
      description: body.description,
      type: body.type || 'LONG',
      visibility: body.visibility || 'PUBLIC',
      tags: tags,
      genre: body.genre,
      ageRestriction: body.ageRestriction,
      orientation: body.orientation,
      videoType: body.videoType || 'single',
      communityId: body.communityId,
      seriesId: body.seriesId,
      episodeNumber: body.episodeNumber ? parseInt(body.episodeNumber) : undefined,
      newSeriesName: body.newSeriesName,
      newSeriesDescription: body.newSeriesDescription,
      totalEpisodes: body.totalEpisodes ? parseInt(body.totalEpisodes) : undefined
    };

    return this.videosService.createVideo(req.user.id, file, createVideoDto)
  }

  @Get(":id")
  getVideo(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.videosService.getVideo(id, req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getVideoFeed(
    @Request() req: RequestWithUser,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("type") type?: string
  ) {
    return this.videosService.getVideoFeed(req.user.id, Number(page), Number(limit), type)
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  updateVideo(
    @Param("id") id: string,
    @Request() req: RequestWithUser,
    @Body() updateVideoDto: UpdateVideoDto
  ) {
    return this.videosService.updateVideo(id, req.user.id, updateVideoDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  deleteVideo(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.videosService.deleteVideo(id, req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/like")
  toggleLike(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.videosService.toggleLike(req.user.id, id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/comment")
  addComment(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() body: AddCommentDto
  ) {
    return this.videosService.addComment(req.user.id, id, body.content, body.parentId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/comments/:commentId/like")
  toggleCommentLike(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Param("commentId") commentId: string
  ) {
    return this.videosService.toggleCommentLike(req.user.id, id, commentId)
  }

  @Get(":id/comments")
  getComments(
    @Param("id") id: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10"
  ) {
    return this.videosService.getComments(id, Number(page), Number(limit))
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/share")
  shareVideo(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() body: { platform: string }
  ) {
    return this.videosService.shareVideo(req.user.id, id, body.platform)
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/view")
  trackView(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.videosService.trackView(req.user.id, id)
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/analytics")
  getVideoAnalytics(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.videosService.getVideoAnalytics(id, req.user.id)
  }

  @Get("trending")
  getTrendingVideos(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10"
  ) {
    return this.videosService.getTrendingVideos(Number(page), Number(limit))
  }
}
