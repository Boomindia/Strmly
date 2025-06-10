import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from "class-validator"

export class CreateVideoDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsEnum(["SHORT", "LONG"])
  type: string

  @IsOptional()
  @IsString()
  communityId?: string

  @IsEnum(["single", "series"])
  videoType: string

  @IsOptional()
  @IsString()
  seriesId?: string

  @IsOptional()
  @IsString()
  newSeriesName?: string

  @IsOptional()
  @IsString()
  newSeriesDescription?: string

  @IsOptional()
  @IsNumber()
  totalEpisodes?: number

  @IsOptional()
  @IsNumber()
  episodeNumber?: number

  @IsEnum(["free", "paid"])
  accessType: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsString()
  genre: string

  @IsEnum(["all", "13+", "16+", "18+"])
  ageRestriction: string

  @IsArray()
  @IsString({ each: true })
  tags: string[]

  @IsEnum(["landscape", "portrait"])
  orientation: string

  @IsEnum(["public", "unlisted", "private"])
  visibility: string
}

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsEnum(["public", "unlisted", "private"])
  visibility?: string

  @IsOptional()
  @IsString()
  thumbnailUrl?: string
}
