import { IsString, IsOptional, IsEmail, IsPhoneNumber } from "class-validator"

export class SignupDto {
  @IsString()
  name: string

  @IsString()
  phoneNumber: string

  @IsString()
  countryCode: string

  @IsOptional()
  @IsEmail()
  email?: string
}

export class LoginDto {
  @IsString()
  phoneNumber: string

  @IsString()
  countryCode: string
}

export class VerifyOtpDto {
  @IsString()
  idToken: string
  
  @IsOptional()
  userData?: {
    name: string
    email?: string
  }
}
