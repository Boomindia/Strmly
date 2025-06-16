import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../prisma/prisma.service"
import type { SignupDto, LoginDto, VerifyOtpDto, CheckUserDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
      if (!userData) {
        throw new UnauthorizedException("User data is required")
      }

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { phoneNumber: userData.phoneNumber },
      })

      if (!user) {
        // Create new user if doesn't exist
        // Generate unique username
        let username = userData.name.toLowerCase().replace(/\s+/g, "_")
        let counter = 1

        while (await this.prisma.user.findUnique({ where: { username } })) {
          username = `${userData.name.toLowerCase().replace(/\s+/g, "_")}_${counter}`
          counter++
        }

        user = await this.prisma.user.create({
          data: {
            phoneNumber: userData.phoneNumber,
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
          website: user.website,
          location: user.location,
        },
      }
    } catch (error) {
      throw new UnauthorizedException("Invalid OTP or token")
    }
  }

  async validateUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    })
    return user
  }

  async checkUser(checkUserDto: CheckUserDto) {
    const { email, provider, providerAccountId } = checkUserDto

    try {
      // Check if user exists by email or provider account
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            {
              accounts: {
                some: {
                  provider,
                  providerAccountId,
                },
              },
            },
          ],
        },
        include: {
          accounts: true,
        },
      })

      if (user) {
        // User exists, generate JWT token
        const accessToken = this.jwtService.sign({
          sub: user.id,
          email: user.email,
        })

        return {
          exists: true,
          user,
          accessToken,
        }
      }

      // User doesn't exist
      return {
        exists: false,
        user: {
          email,
          provider,
          providerAccountId,
        },
      }
    } catch (error) {
      throw new UnauthorizedException("Invalid user data")
    }
  }

  async register(registerDto: any) {
    const { email, name, picture, provider, providerAccountId, ...userData } = registerDto

    try {
      // Generate unique username
      let username = name.toLowerCase().replace(/\s+/g, "_")
      let counter = 1

      while (await this.prisma.user.findUnique({ where: { username } })) {
        username = `${name.toLowerCase().replace(/\s+/g, "_")}_${counter}`
        counter++
      }

      // Create new user with account
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          username,
          avatar: picture,
          bio: `Hello! I'm ${name.split(" ")[0]}. Welcome to my profile! 👋`,
          accounts: {
            create: {
              provider,
              providerAccountId,
              type: "oauth",
              access_token: "",
              refresh_token: "",
              expires_at: 0,
              token_type: "Bearer",
              scope: "email profile",
            },
          },
        },
        include: {
          accounts: true,
        },
      })

      // Generate JWT token
      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      })

      return {
        user,
        accessToken,
      }
    } catch (error) {
      throw new UnauthorizedException("Failed to register user")
    }
  }

  async createUser(data: {
    email: string
    name: string
    picture?: string
    provider: string
    providerAccountId: string
    firstName?: string
    lastName?: string
    locale?: string
    verifiedEmail?: boolean
  }) {
    try {
      // Generate unique username from name
      const baseName = data.firstName || data.name.split(" ")[0] || "user"
      let username = baseName.toLowerCase().replace(/[^a-z0-9]/g, "_")
      let counter = 1

      while (await this.prisma.user.findUnique({ where: { username } })) {
        username = `${baseName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${counter}`
        counter++
      }

      // Create comprehensive bio based on available information
      const firstName = data.firstName || data.name.split(" ")[0]
      const bio = `Hello! I'm ${firstName}. Welcome to my profile! 👋`

      // Create new user with comprehensive Google data
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          username,
          avatar: data.picture,
          bio,
          isVerified: data.verifiedEmail || false,
          // Set location based on locale if available
          location: data.locale ? this.getLocationFromLocale(data.locale) : undefined,
          accounts: {
            create: {
              provider: data.provider,
              providerAccountId: data.providerAccountId,
              type: "oauth",
              access_token: "",
              refresh_token: "",
              expires_at: 0,
              token_type: "Bearer",
              scope: "email profile",
            },
          },
        },
        include: {
          accounts: true,
        },
      })

      return user
    } catch (error) {
      console.error("Error creating user:", error)
      throw new UnauthorizedException("Failed to create user")
    }
  }

  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    }
    return this.jwtService.sign(payload)
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token)
      return payload
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
  }

  async updateUser(
    userId: string,
    data: {
      name?: string
      avatar?: string
      email?: string
      bio?: string
      website?: string
      location?: string
    },
  ) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          avatar: data.avatar,
          email: data.email,
          bio: data.bio,
          website: data.website,
          location: data.location,
          updatedAt: new Date(),
        },
        include: {
          accounts: true,
        },
      })
      return user
    } catch (error) {
      console.error("Error updating user:", error)
      throw new UnauthorizedException("Failed to update user")
    }
  }

  private getLocationFromLocale(locale: string): string | undefined {
    const localeMap: { [key: string]: string } = {
      "en-US": "United States",
      "en-GB": "United Kingdom",
      "en-CA": "Canada",
      "en-AU": "Australia",
      "en-IN": "India",
      "es-ES": "Spain",
      "es-MX": "Mexico",
      "fr-FR": "France",
      "de-DE": "Germany",
      "it-IT": "Italy",
      "pt-BR": "Brazil",
      "ja-JP": "Japan",
      "ko-KR": "South Korea",
      "zh-CN": "China",
      "zh-TW": "Taiwan",
      "ru-RU": "Russia",
      "ar-SA": "Saudi Arabia",
      "hi-IN": "India",
    }

    return localeMap[locale] || undefined
  }
}
