import { IsString, IsEmail, IsOptional, IsBoolean } from "class-validator"

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  website?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean
}
