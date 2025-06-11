import { Injectable, BadRequestException, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as AWS from "aws-sdk"
import { v4 as uuidv4 } from "uuid"
import * as sharp from "sharp"
import type { Express } from "express"

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private s3: AWS.S3
  private bucketName: string
  private region: string

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION"),
    })
    this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME")
    this.region = this.configService.get("AWS_REGION")
  }

  async uploadFileToS3(
    file: Express.Multer.File | NodeJS.ReadableStream | Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file instanceof Buffer ? file : (file as any),
      ContentType: contentType,
      ACL: "public-read",
    }

    try {
      const result = await this.s3.upload(params).promise()
      this.logger.log(`File uploaded successfully: ${result.Location}`)
      return result.Location
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`)
      throw new BadRequestException(`Failed to upload file: ${error.message}`)
    }
  }

  async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
      ContentType: contentType,
      ACL: "public-read",
    }

    try {
      return await this.s3.getSignedUrlPromise("putObject", params)
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`)
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`)
    }
  }

  async deleteFileFromS3(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    }

    try {
      await this.s3.deleteObject(params).promise()
      this.logger.log(`File deleted successfully: ${key}`)
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`)
      throw new BadRequestException(`Failed to delete file: ${error.message}`)
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image files are allowed")
    }

    // Validate file size (max 10MB for images)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException("Image file size too large. Maximum 10MB allowed.")
    }

    try {
      // Process image with Sharp
      const processedImage = await sharp(file.buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const key = `${folder}/${uuidv4()}.jpg`
      return this.uploadFileToS3(processedImage, key, "image/jpeg")
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`)
      throw new BadRequestException(`Failed to process image: ${error.message}`)
    }
  }

  async uploadVideo(file: Express.Multer.File, folder: string): Promise<string> {
    // Validate file type
    if (!file.mimetype.startsWith("video/")) {
      throw new BadRequestException("Only video files are allowed")
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > maxSize) {
      throw new BadRequestException("Video file size too large. Maximum 2GB allowed.")
    }

    const extension = file.originalname.split(".").pop()
    const key = `${folder}/${uuidv4()}.${extension}`
    return this.uploadFileToS3(file.buffer, key, file.mimetype)
  }

  async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    }

    try {
      return await this.s3.headObject(params).promise()
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${error.message}`)
      throw new BadRequestException(`Failed to get file metadata: ${error.message}`)
    }
  }

  generateThumbnailKey(videoKey: string): string {
    const videoId = videoKey.split("/").pop()?.split(".")[0]
    return `thumbnails/${videoId}_thumbnail.jpg`
  }

  generateVideoKey(userId: string, filename: string): string {
    const extension = filename.split(".").pop()
    return `videos/${userId}/${uuidv4()}.${extension}`
  }

  generateProfileImageKey(userId: string): string {
    return `profiles/${userId}/${uuidv4()}.jpg`
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }

  async downloadFromS3(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Extract bucket and key from S3 URL
      const urlParts = url.replace("https://", "").split("/")
      const bucket = urlParts[0].split(".")[0]
      const key = urlParts.slice(1).join("/")

      const params = {
        Bucket: bucket,
        Key: key,
      }

      const fileStream = require("fs").createWriteStream(outputPath)
      const s3Stream = this.s3.getObject(params).createReadStream()

      s3Stream.pipe(fileStream)

      s3Stream.on("error", (error) => {
        this.logger.error(`Failed to download from S3: ${error.message}`)
        reject(new BadRequestException(`Failed to download from S3: ${error.message}`))
      })

      fileStream.on("error", (error) => {
        this.logger.error(`Failed to write file: ${error.message}`)
        reject(new BadRequestException(`Failed to write file: ${error.message}`))
      })

      fileStream.on("close", () => {
        this.logger.log(`File downloaded successfully: ${outputPath}`)
        resolve()
      })
    })
  }
}
