import { Injectable, BadRequestException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import * as sharp from "sharp"
import type { Express } from "express"

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private s3Client: S3Client
  private bucketName: string
  private region: string

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME") || ""
    this.region = this.configService.get<string>("AWS_REGION") || ""

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
      },
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    contentType: string,
  ): Promise<string> {
    console.log('Starting file upload to S3...');
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer
    });

    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;
      console.log('Generated S3 key:', key);

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: contentType,
      };
      console.log('S3 upload params:', {
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType,
        BodySize: file.buffer?.length
      });

      console.log('Uploading to S3...');
      await this.s3Client.send(new PutObjectCommand(params));
      console.log('Upload successful');

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      console.log('Generated URL:', url);
      return url;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return this.uploadFile(file, folder, file.mimetype)
  }

  async uploadVideo(file: Express.Multer.File, folder: string): Promise<string> {
    return this.uploadFile(file, folder, file.mimetype)
  }

  async deleteFileFromS3(url: string): Promise<void> {
    const key = url.split(".com/")[1]
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    try {
      await this.s3Client.send(command)
    } catch (error) {
      console.error("Error deleting file from S3:", error)
      throw error
    }
  }

  async batchUpload(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => {
      const folder = file.mimetype.startsWith("image/") ? "images" : "videos"
      return this.uploadFile(file, folder, file.mimetype)
    })

    return Promise.all(uploadPromises)
  }

  async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    })

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn })
      return url
    } catch (error) {
      console.error("Error generating presigned URL:", error)
      throw error
    }
  }

  async getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    try {
      return await this.s3Client.send(command)
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

  async downloadFile(key: string, outputPath: string): Promise<void> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    try {
      const response = await this.s3Client.send(command)
      const fileStream = require("fs").createWriteStream(outputPath)
      
      if (response.Body) {
        const stream = response.Body as any
        stream.pipe(fileStream)
      }

      return new Promise((resolve, reject) => {
        fileStream.on("finish", resolve)
        fileStream.on("error", reject)
      })
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`)
      throw new BadRequestException(`Failed to download file: ${error.message}`)
    }
  }

  async generateThumbnail(file: Express.Multer.File): Promise<Buffer> {
    try {
      const thumbnail = await sharp(file.buffer)
        .resize(320, 180, {
          fit: "cover",
          position: "center",
        })
        .toBuffer()
      return thumbnail
    } catch (error) {
      console.error("Error generating thumbnail:", error)
      throw error
    }
  }
}
