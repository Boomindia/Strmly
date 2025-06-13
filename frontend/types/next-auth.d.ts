import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    needsRegistration?: boolean
    registrationData?: {
      email: string
      name: string
      picture?: string
      provider: string
      providerAccountId: string
    }
  }

  interface User {
    accessToken?: string
    needsRegistration?: boolean
    registrationData?: {
      email: string
      name: string
      picture?: string
      provider: string
      providerAccountId: string
    }
    provider?: string
    providerAccountId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    needsRegistration?: boolean
    registrationData?: {
      email: string
      name: string
      picture?: string
      provider: string
      providerAccountId: string
    }
    provider?: string
    providerAccountId?: string
    checked?: boolean
  }
} 