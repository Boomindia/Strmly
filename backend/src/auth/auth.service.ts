import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../prisma/prisma.service"
import type { SignupDto, LoginDto, VerifyOtpDto, CheckUserDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
      throw new UnauthorizedException('Invalid user data')
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
          accounts: {
            create: {
              provider,
              providerAccountId,
              type: "oauth",
            },
          },
          ...userData,
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
      throw new UnauthorizedException('Failed to register user')
    }
  }

  async handleNextAuthUser(data: {
    email: string
    name: string
    picture?: string
    provider: string
    providerAccountId: string
  }) {
    try {
      // Check if user exists by email or provider account
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            {
              accounts: {
                some: {
                  provider: data.provider,
                  providerAccountId: data.providerAccountId,
                },
              },
            },
          ],
        },
        include: {
          accounts: true,
        },
      })

      if (!user) {
        // Generate unique username
        let username = data.name.toLowerCase().replace(/\s+/g, "_")
        let counter = 1

        while (await this.prisma.user.findUnique({ where: { username } })) {
          username = `${data.name.toLowerCase().replace(/\s+/g, "_")}_${counter}`
          counter++
        }

        // Create new user with account
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            username,
            avatar: data.picture,
            accounts: {
              create: {
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                type: "oauth",
              },
            },
          },
          include: {
            accounts: true,
          },
        })
      } else {
        // Update existing user's account if needed
        const existingAccount = user.accounts.find(
          (acc) => acc.provider === data.provider && acc.providerAccountId === data.providerAccountId
        )

        if (!existingAccount) {
          await this.prisma.account.create({
            data: {
              userId: user.id,
              provider: data.provider,
              providerAccountId: data.providerAccountId,
              type: "oauth",
            },
          })
        }

        // Update user info if needed
        if (user.name !== data.name || user.avatar !== data.picture) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              name: data.name,
              avatar: data.picture,
            },
            include: {
              accounts: true,
            },
          })
        }
      }

      return user
    } catch (error) {
      throw new UnauthorizedException('Failed to handle NextAuth user')
    }
  }
}
