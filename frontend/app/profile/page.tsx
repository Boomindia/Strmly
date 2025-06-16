"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Grid,
  Video,
  Bookmark,
  MapPin,
  LinkIcon,
  Calendar,
  Users,
  BarChart3,
  Edit,
  History,
  List,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

const mockPosts = [
  { id: 1, image: "/placeholder.svg?height=300&width=300", type: "image" },
  { id: 2, image: "/placeholder.svg?height=300&width=300", type: "video" },
  { id: 3, image: "/placeholder.svg?height=300&width=300", type: "image" },
  { id: 4, image: "/placeholder.svg?height=300&width=300", type: "video" },
  { id: 5, image: "/placeholder.svg?height=300&width=300", type: "image" },
  { id: 6, image: "/placeholder.svg?height=300&width=300", type: "video" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")
  const { user, isLoggedIn, token, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    logout()
    router.push("/auth")
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth")
      return
    }

    // Fetch user data if we have a token
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user data")
          return res.json()
        })
        .then((userData) => {
          useAuthStore.getState().setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            image: userData.avatar,
            avatar: userData.avatar,
            username: userData.username,
            bio: userData.bio,
            isVerified: userData.isVerified,
          })
        })
        .catch((err) => {
          console.error("Error fetching user data:", err)
        })
    }
  }, [isLoggedIn, router, token])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const userData = {
    name: user.name || "User",
    email: user.email || "",
    image: user.avatar || user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    username: user.username || user.email?.split("@")[0] || "user",
    bio: user.bio || "Welcome to my profile! 👋",
    location: user.location || "Not specified",
    website: user.website || "",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
    followers: 0,
    following: 0,
    posts: 0,
    isVerified: user.isVerified || false,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="h-48 bg-muted relative">
        <img
          src={userData.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* Add Sign Out button for mobile */}
        <div className="absolute top-4 right-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="bg-[#f62000] hover:bg-[#f62000]/90 rounded-full p-2"
          >
            <LogOut size={20} className="text-white" />
          </Button>
        </div>
        {/* Add Sign Out button for desktop */}
        <div className="absolute top-4 right-4 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="bg-[#f62000] hover:bg-[#f62000]/90 rounded-full p-2"
          >
            <LogOut size={20} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={userData.image} alt={userData.name} />
              <AvatarFallback>{userData.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-muted-foreground">@{userData.username}</p>
                {userData.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full" onClick={()=>{router.push("/profile/edit")}}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <p className="text-muted-foreground">{userData.bio}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
            {userData.location && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {userData.location}
              </span>
            )}
            {userData.website && (
              <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center">
                <LinkIcon className="w-4 h-4 mr-1" />
                {userData.website}
              </a>
            )}
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Joined {userData.joinedDate}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex space-x-6">
          <div>
            <span className="font-bold">{userData.followers}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div>
            <span className="font-bold">{userData.following}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
          <div>
            <span className="font-bold">{userData.posts}</span>{" "}
            <span className="text-muted-foreground">Posts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b">
          <div className="flex space-x-8">
            <button
              className={`pb-4 ${
                activeTab === "posts"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`pb-4 ${
                activeTab === "likes"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("likes")}
            >
              Likes
            </button>
            <button
              className={`pb-4 ${
                activeTab === "saved"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "posts" && (
            <div className="text-center text-muted-foreground py-8">
              No posts yet
            </div>
          )}
          {activeTab === "likes" && (
            <div className="text-center text-muted-foreground py-8">
              No liked posts yet
            </div>
          )}
          {activeTab === "saved" && (
            <div className="text-center text-muted-foreground py-8">
              No saved posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}