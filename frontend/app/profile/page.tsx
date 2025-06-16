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
  Heart,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import UserList from "@/components/UserList"

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
  const [userData, setUserData] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const { user, isLoggedIn, token, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    logout()
    router.push("/auth")
  }

  const fetchUserVideos = async () => {
    if (!userData?.id) return
    setIsLoadingVideos(true)
    try {
      const data = await api.getUserVideos(userData.id)
      const transformedVideos = data.map((video: any) => ({
        _id: video._id,
        title: video.title,
        description: video.description || "",
        thumbnail: video.thumbnailUrl || "/placeholder.svg",
        likes: video.likesCount || 0,
        views: video.viewsCount || 0,
        createdAt: video.createdAt
      }))
      setVideos(transformedVideos)
    } catch (err) {
      console.error("Error fetching user videos:", err)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth")
      return
    }

    const fetchUserData = async () => {
      try {
        const data = await api.getUserProfile()
        setUserData(data)
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchUserData()
    }
  }, [isLoggedIn, router, token])

  useEffect(() => {
    if (userData?.id) {
      fetchUserVideos()
    }
  }, [userData?.id])

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const profileData = {
    name: userData.name || "User",
    email: userData.email || "",
    image: userData.avatar || userData.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    username: userData.username || userData.email?.split("@")[0] || "user",
    bio: userData.bio || "Welcome to my profile! 👋",
    location: userData.location || "Not specified",
    website: userData.website || "",
    joinedDate: new Date(userData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop",
    followers: userData.stats?.followersCount || 0,
    following: userData.stats?.followingCount || 0,
    posts: userData.stats?.videosCount || 0,
    isVerified: userData.isVerified || false,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="h-48 bg-muted relative">
        <img
          src={profileData.coverImage}
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
              <AvatarImage src={profileData.image} alt={profileData.name} />
              <AvatarFallback>{profileData.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                <p className="text-muted-foreground">@{profileData.username}</p>
                {profileData.isVerified && (
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
          <p className="text-muted-foreground">{profileData.bio}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
            {profileData.location && (
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {profileData.location}
              </span>
            )}
            {profileData.website && (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center">
                <LinkIcon className="w-4 h-4 mr-1" />
                {profileData.website}
              </a>
            )}
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Joined {profileData.joinedDate}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex space-x-6">
          <div className="cursor-pointer hover:text-primary" onClick={() => setActiveTab("followers")}>
            <span className="font-bold">{profileData.followers}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="cursor-pointer hover:text-primary" onClick={() => setActiveTab("following")}>
            <span className="font-bold">{profileData.following}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="cursor-pointer hover:text-primary" onClick={() => setActiveTab("posts")}>
            <span className="font-bold">{profileData.posts}</span>{" "}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingVideos ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {videos.map((video) => (
                    <div key={video._id} className="relative aspect-square group">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex items-center space-x-4 text-white">
                          <div className="flex items-center">
                            <Heart className="w-5 h-5 mr-1" />
                            <span>{video.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-5 h-5 mr-1" />
                            <span>{video.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No posts yet
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === "followers" && (
            <UserList userId={userData.id} type="followers" />
          )}
          {activeTab === "following" && (
            <UserList userId={userData.id} type="following" />
          )}
          {activeTab === "likes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.likedVideos?.map((video: any) => (
                <div key={video.id} className="relative aspect-square group">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 mr-1" />
                        <span>{video.likes || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 mr-1" />
                        <span>{video.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!userData.likedVideos || userData.likedVideos.length === 0) && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No liked posts yet
                </div>
              )}
            </div>
          )}
          {activeTab === "saved" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.savedVideos?.map((video: any) => (
                <div key={video.id} className="relative aspect-square group">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 mr-1" />
                        <span>{video.likes || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 mr-1" />
                        <span>{video.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!userData.savedVideos || userData.savedVideos.length === 0) && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No saved posts yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}