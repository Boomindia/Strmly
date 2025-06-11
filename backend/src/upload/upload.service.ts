import { Injectable, BadRequestException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { S3 } from "aws-sdk"
import { v4 as uuidv4 } from "uuid"
import * as sharp from "sharp"
import type { Express } from "express"

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private s3: S3
  private bucketName: string
  private region: string

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME") || ""
    this.region = this.configService.get<string>("AWS_REGION") || ""

    this.s3 = new S3({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
      },
    })
  }

  async uploadFile(
    file: Express.Multer.File | NodeJS.ReadableStream | Buffer,
    folder: string,
    contentType: string,
  ): Promise<string> {
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}`

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read",
    }

    const result = await this.s3.upload(params).promise()
    return result.Location
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return this.uploadFile(file, folder, file.mimetype)
  }

  async uploadVideo(file: Express.Multer.File, folder: string): Promise<string> {
    return this.uploadFile(file, folder, file.mimetype)
  }

  async deleteFileFromS3(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    }

    await this.s3.deleteObject(params).promise()
  }

  async batchUpload(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => {
      const folder = file.mimetype.startsWith("image/") ? "images" : "videos"
      return this.uploadFile(file, folder, file.mimetype)
    })

    return Promise.all(uploadPromises)
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
