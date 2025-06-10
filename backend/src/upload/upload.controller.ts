import { Controller, Post, Get, Delete, UseInterceptors, UseGuards, Request, Body, Param, Query, BadRequestException } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import type { UploadService } from "./upload.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { Express } from "express"
import type { GeneratePresignedUrlDto, DeleteFileDto } from "./dto/upload.dto"

@Controller("upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("image")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException("No image file provided")
    }

    const userId = req.user.id
    const imageUrl = await this.uploadService.uploadImage(file, `images/${userId}`)

    return {
      success: true,
      imageUrl,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }
  }

  @Post("video")
  @UseInterceptors(FileInterceptor("video"))
  async uploadVideo(file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException("No video file provided")
    }

    const userId = req.user.id
    const videoUrl = await this.uploadService.uploadVideo(file, `videos/${userId}`)

    return {
      success: true,
      videoUrl,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      duration: null, // Will be populated after processing
    }
  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException("No avatar file provided")
    }

    const userId = req.user.id
    const avatarUrl = await this.uploadService.uploadImage(file, `avatars/${userId}`)

    return {
      success: true,
      avatarUrl,
      filename: file.originalname,
      size: file.size,
    }
  }

  @Post("thumbnail")
  @UseInterceptors(FileInterceptor("thumbnail"))
  async uploadThumbnail(file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException("No thumbnail file provided")
    }

    const userId = req.user.id
    const thumbnailUrl = await this.uploadService.uploadImage(file, `thumbnails/${userId}`)

    return {
      success: true,
      thumbnailUrl,
      filename: file.originalname,
      size: file.size,
    }
  }

  @Post("presigned-url")
  async generatePresignedUrl(@Body() generatePresignedUrlDto: GeneratePresignedUrlDto, @Request() req: any) {
    const userId = req.user.id
    const { fileType, fileName, contentType } = generatePresignedUrlDto

    let folder = ""
    switch (fileType) {
      case "image":
        folder = `images/${userId}`
        break
      case "video":
        folder = `videos/${userId}`
        break
      case "avatar":
        folder = `avatars/${userId}`
        break
      case "thumbnail":
        folder = `thumbnails/${userId}`
        break
      default:
        throw new BadRequestException("Invalid file type")
    }

    const key = this.uploadService.generateVideoKey(userId, fileName)
    const presignedUrl = await this.uploadService.generatePresignedUrl(key, contentType)

    return {
      success: true,
      presignedUrl,
      key,
      expiresIn: 3600, // 1 hour
    }
  }

  @Get("metadata/:key")
  async getFileMetadata(@Param("key") key: string, @Request() req: any) {
    // Verify user owns this file by checking if key contains their user ID
    const userId = req.user.id
    if (!key.includes(userId)) {
      throw new BadRequestException("Access denied")
    }

    const metadata = await this.uploadService.getFileMetadata(key)

    return {
      success: true,
      metadata: {
        size: metadata.ContentLength,
        contentType: metadata.ContentType,
        lastModified: metadata.LastModified,
        etag: metadata.ETag,
      },
    }
  }

  @Delete("file")
  async deleteFile(@Body() deleteFileDto: DeleteFileDto, @Request() req: any) {
    const userId = req.user.id
    const { key } = deleteFileDto

    // Verify user owns this file
    if (!key.includes(userId)) {
      throw new BadRequestException("Access denied")
    }

    await this.uploadService.deleteFileFromS3(key)

    return {
      success: true,
      message: "File deleted successfully",
    }
  }

  @Get("signed-url/:key")
  async getSignedUrl(@Param("key") key: string, @Query("expires") expires = 3600, @Request() req: any) {
    const userId = req.user.id

    // Verify user owns this file
    if (!key.includes(userId)) {
      throw new BadRequestException("Access denied")
    }

    const signedUrl = await this.uploadService.generatePresignedUrl(key, "application/octet-stream", expires)

    return {
      success: true,
      signedUrl,
      expiresIn: expires,
    }
  }

  @Post("batch-upload")
  @UseInterceptors(FileInterceptor("files"))
  async batchUpload(files: Express.Multer.File[], @Request() req: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files provided")
    }

    const userId = req.user.id
    const uploadPromises = files.map(async (file) => {
      let url = ""
      if (file.mimetype.startsWith("image/")) {
        url = await this.uploadService.uploadImage(file, `images/${userId}`)
      } else if (file.mimetype.startsWith("video/")) {
        url = await this.uploadService.uploadVideo(file, `videos/${userId}`)
      } else {
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`)
      }

      return {
        filename: file.originalname,
        url,
        size: file.size,
        mimeType: file.mimetype,
      }
    })

    const results = await Promise.all(uploadPromises)

    return {
      success: true,
      files: results,
      totalFiles: results.length,
    }
  }
}