import { IsString, IsEmail, IsOptional, IsBoolean, IsPhoneNumber } from "class-validator"

export class CreateUserDto {
  @IsString()
  firebaseUid: string

  @IsPhoneNumber()
  phoneNumber: string

  @IsString()
  name: string

  @IsString()
  username: string

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
  isVerified?: boolean

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean
}

export class UpdateUserDto {
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
