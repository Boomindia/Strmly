import { IsString, IsEmail, IsOptional, IsArray, IsEnum } from "class-validator"

export class RegisterUserDto {
  @IsString()
  firebaseUid: string

  @IsString()
  phoneNumber: string

  @IsString()
  name: string

  @IsString()
  username: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsEnum(["male", "female", "other", "prefer-not-to-say"])
  gender: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @IsOptional()
  @IsString()
  location?: string
}
