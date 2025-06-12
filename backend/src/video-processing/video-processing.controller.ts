import { Controller, Get, UseGuards, Param } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { VideoProcessingService } from "./video-processing.service"

@Controller("video-processing")
@UseGuards(JwtAuthGuard)
export class VideoProcessingController {
  constructor(private videoProcessingService: VideoProcessingService) {}

  @Get("status/:videoId")
  async getProcessingStatus(@Param("videoId") videoId: string) {
    return this.videoProcessingService.getProcessingStatus(videoId)
  }
}
