import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsIn } from "class-validator"

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
    phoneNumber: string
  }
}

export class CheckUserDto {
  email: string
  provider: string
  providerAccountId: string
}

export class RegisterDto {
  email: string
  name: string
  picture?: string
  provider: string
  providerAccountId: string
  username?: string
  gender?: string
  selectedPreferences?: string[]
  selectedLanguages?: string[]
  location?: string
}
