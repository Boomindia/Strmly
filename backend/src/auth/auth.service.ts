import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as admin from "firebase-admin"
import { PrismaService } from "../prisma/prisma.service"
import type { SignupDto, LoginDto, VerifyOtpDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get("FIREBASE_PROJECT_ID"),
          privateKey: this.configService.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
          clientEmail: this.configService.get("FIREBASE_CLIENT_EMAIL"),
        }),
      })
    }
  }

  async signup(signupDto: SignupDto) {
    const { name, phoneNumber, countryCode } = signupDto
    const fullPhoneNumber = `${countryCode}${phoneNumber}`

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: fullPhoneNumber },
    })

    if (existingUser) {
      throw new ConflictException("User with this phone number already exists")
    }

    // Generate username from name
    const baseUsername = name.toLowerCase().replace(/\s+/g, "_")
    let username = baseUsername
    let counter = 1

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${counter}`
      counter++
    }

    return {
      message: "User registration initiated. Please verify OTP.",
      phoneNumber: fullPhoneNumber,
      username,
    }
  }

  async login(loginDto: LoginDto) {
    const { phoneNumber, countryCode } = loginDto
    const fullPhoneNumber = `${countryCode}${phoneNumber}`

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: fullPhoneNumber },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return {
      message: "Please verify OTP to login",
      phoneNumber: fullPhoneNumber,
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { idToken, userData } = verifyOtpDto

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      const firebaseUid = decodedToken.uid
      const phoneNumber = decodedToken.phone_number

      if (!phoneNumber) {
        throw new UnauthorizedException("Phone number not found in token")
      }

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { firebaseUid },
      })

      if (!user) {
        // Create new user if doesn't exist
        if (!userData) {
          throw new UnauthorizedException("User data required for new registration")
        }

        // Generate unique username
        let username = userData.name.toLowerCase().replace(/\s+/g, "_")
        let counter = 1

        while (await this.prisma.user.findUnique({ where: { username } })) {
          username = `${userData.name.toLowerCase().replace(/\s+/g, "_")}_${counter}`
          counter++
        }

        user = await this.prisma.user.create({
          data: {
            firebaseUid,
            phoneNumber,
            name: userData.name,
            username,
            email: userData.email,
          },
        })
      }

      // Generate JWT token
      const payload = { sub: user.id, username: user.username }
      const accessToken = this.jwtService.sign(payload)

      return {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          phoneNumber: user.phoneNumber,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified,
        },
      }
    } catch (error) {
      throw new UnauthorizedException("Invalid OTP or token")
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        phoneNumber: true,
        email: true,
        avatar: true,
        bio: true,
        isVerified: true,
        isPrivate: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return user
  }
}
