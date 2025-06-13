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
  async checkUser(@Body() checkUserDto: CheckUserDto) {
    return this.authService.checkUser(checkUserDto)
  }

  @Post("register")
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto)
  }

  @Post("nextauth-callback")
  async handleNextAuthCallback(@Body() data: any) {
    const { account, profile } = data

    // Create or update user
    const user = await this.authService.handleNextAuthUser({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    })

    return user
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user
  }
}
