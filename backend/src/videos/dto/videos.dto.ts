import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ["SHORT", "LONG"] })
  @IsEnum(["SHORT", "LONG"])
  type: "SHORT" | "LONG"

  @ApiProperty({ enum: ["PUBLIC", "UNLISTED", "PRIVATE"] })
  @IsEnum(["PUBLIC", "UNLISTED", "PRIVATE"])
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE"

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityId?: string
}

export class UpdateVideoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(["PUBLIC", "UNLISTED", "PRIVATE"])
  visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE"

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[]
}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  content: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string
}
