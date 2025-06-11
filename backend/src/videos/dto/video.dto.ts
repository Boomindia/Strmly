import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from "class-validator"

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: ["SHORT", "LONG"], default: "SHORT" })
  @IsEnum(["SHORT", "LONG"])
  @IsOptional()
  type?: string

  @ApiProperty({ enum: ["PUBLIC", "UNLISTED", "PRIVATE"], default: "PUBLIC" })
  @IsEnum(["PUBLIC", "UNLISTED", "PRIVATE"])
  @IsOptional()
  visibility?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  price?: number

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[]

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seriesId?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  episodeNumber?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  communityId?: string

  @IsEnum(["single", "series"])
  videoType: string

  @IsOptional()
  @IsString()
  newSeriesName?: string

  @IsOptional()
  @IsString()
  newSeriesDescription?: string

  @IsOptional()
  @IsNumber()
  totalEpisodes?: number

  @IsString()
  genre: string

  @IsEnum(["all", "13+", "16+", "18+"])
  ageRestriction: string

  @IsEnum(["landscape", "portrait"])
  orientation: string
}

export class UpdateVideoDto extends CreateVideoDto {}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  content: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parentId?: string
}
