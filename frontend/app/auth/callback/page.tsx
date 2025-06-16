"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, setUser } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      console.error("Authentication error:", error)
      router.push("/auth?error=" + encodeURIComponent(error))
      return
    }

    if (token) {
      // First login with token
      login(token)
        .then(() => {
          // Then fetch comprehensive user profile
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user profile")
          }
          return res.json()
        })
        .then((userData) => {
          // Update user data in store with comprehensive profile information
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            image: userData.avatar,
            avatar: userData.avatar,
            username: userData.username,
            bio: userData.bio,
            isVerified: userData.isVerified,
            website: userData.website,
            location: userData.location,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            joinedDate: userData.joinedDate,
            provider: userData.provider,
          })

          // Redirect to profile page to show the updated information
          router.push("/profile")
        })
        .catch((error) => {
          console.error("Error during login:", error)
          router.push("/auth?error=" + encodeURIComponent("Failed to complete authentication"))
        })
    } else {
      router.push("/auth")
    }
  }, [searchParams, router, login, setUser])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Completing sign in and setting up your profile...</p>
      </div>
    </div>
  )
}
