import { Controller, Post, Body, UseGuards, Get, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import type { SignupDto, LoginDto, VerifyOtpDto, CheckUserDto } from "./dto/auth.dto"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }

  @Post("login")
  async login(loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("verify-otp")
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto)
  }

  @Post("check-user")
  async checkUser(checkUserDto: CheckUserDto) {
    return this.authService.checkUser(checkUserDto)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(req) {
    return req.user
  }
}
