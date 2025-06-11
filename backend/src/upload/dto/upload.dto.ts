import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from "class-validator"

export class GeneratePresignedUrlDto {
  @IsEnum(["image", "video", "avatar", "thumbnail"])
  fileType: "image" | "video" | "avatar" | "thumbnail"

  @IsString()
  fileName: string

  @IsString()
  contentType: string

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400) // Max 24 hours
  expiresIn?: number
}

export class DeleteFileDto {
  @IsString()
  key: string
}

export class UploadResponseDto {
  success: boolean
  url?: string
  key?: string
  filename?: string
  size?: number
  mimeType?: string
}

export class BatchUploadResponseDto {
  success: boolean
  files: UploadResponseDto[]
  totalFiles: number
}
