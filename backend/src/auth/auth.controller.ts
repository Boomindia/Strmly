import { Controller, Post, Body, UseGuards, Get, Request, Req, Res, UnauthorizedException } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import type { SignupDto, LoginDto, VerifyOtpDto, CheckUserDto } from "./dto/auth.dto"
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.authService.validateUser(req.user.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      bio: user.bio,
      isVerified: user.isVerified,
      website: user.website,
      location: user.location,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      provider: user.accounts[0]?.provider,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const { user } = req;
    const token = await this.authService.generateToken(user);
    
    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateToken(@Req() req: any) {
    const user = await this.authService.validateUser(req.user.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.avatar,
      username: user.username,
      bio: user.bio,
      isVerified: user.isVerified,
    };
  }

  @Post('logout')
  async logout() {
    // Since we're using JWT, we don't need to do anything on the server
    // The client should remove the token
    return { success: true };
  }
}
