import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide NEXTAUTH_SECRET environment variable")
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("Please provide NEXTAUTH_URL environment variable")
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: "google",
          providerAccountId: profile.sub,
        }
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: "apple",
          providerAccountId: profile.sub,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || !user.email) {
        return false
      }

      try {
        // Store the user data in the token for later use
        user.provider = account.provider
        user.providerAccountId = account.providerAccountId
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.provider = user.provider
        token.providerAccountId = user.providerAccountId
      }

      // Check user existence on the backend
      if (account && !token.checked) {
        try {
          const response = await fetch(`${API_URL}/auth/check-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: token.email,
              name: token.name,
              picture: token.picture,
              provider: token.provider,
              providerAccountId: token.providerAccountId,
            }),
          })

          if (!response.ok) {
            console.error("Error checking user:", await response.text())
            return token
          }

          const data = await response.json()
          token.checked = true

          if (data.exists) {
            token.accessToken = data.accessToken
            token.needsRegistration = false
          } else {
            token.needsRegistration = true
            token.registrationData = {
              email: token.email ?? "",
              name: token.name ?? "",
              picture: token.picture ?? "",
              provider: token.provider ?? "",
              providerAccountId: token.providerAccountId ?? "",
            }
          }
        } catch (error) {
          console.error("Error checking user:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
          image: token.picture,
          provider: token.provider,
          providerAccountId: token.providerAccountId,
        }
        session.accessToken = token.accessToken
        session.needsRegistration = token.needsRegistration
        session.registrationData = token.registrationData
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 