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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
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
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  const userData = {
    name: session.user.name || "User",
    email: session.user.email || "",
    image: session.user.image || "/placeholder.svg?height=120&width=120",
    username: session.user.email?.split("@")[0] || "user",
    bio: "Welcome to my profile! 👋",
    location: "Not specified",
    website: "",
    joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    coverImage: "/placeholder.svg?height=200&width=800",
    followers: 0,
    following: 0,
    posts: 0,
    isVerified: false,
  }

  return (
    <div className="pb-20 md:pb-4">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/40">
        <Image src={userData.coverImage} alt="Cover" fill className="object-cover" />
        <div className="absolute top-4 right-4">
          <Link href="/profile/edit">
            <Button variant="secondary" size="sm">
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          <Avatar className="w-32 h-32 border-4 border-background mb-4 md:mb-0">
            <AvatarImage src={userData.image} />
            <AvatarFallback className="text-2xl">{userData.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              {userData.isVerified && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mb-2">@{userData.username}</p>
            <p className="mb-3">{userData.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {userData.location !== "Not specified" && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {userData.location}
                </div>
              )}
              {userData.website && (
                <div className="flex items-center">
                  <LinkIcon size={14} className="mr-1" />
                  {userData.website}
                </div>
              )}
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Joined {userData.joinedDate}
              </div>
            </div>

            <div className="flex space-x-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-lg">{userData.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userData.followers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userData.following}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/profile/community">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <Users size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">My Community</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/dashboard">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <BarChart3 size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Dashboard</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/history">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <History size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">History</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/playlist">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <List size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Playlist</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/settings">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-4 text-center">
                <Settings size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Settings</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center">
              <Grid size={16} className="mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video size={16} className="mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <Bookmark size={16} className="mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {mockPosts.map((post) => (
                <div key={post.id} className="aspect-square relative group cursor-pointer">
                  <Image
                    src={post.image}
                    alt={`Post ${post.id}`}
                    fill
                    className="object-cover rounded-sm"
                  />
                  {post.type === "video" && (
                    <div className="absolute top-2 right-2">
                      <Video size={16} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockPosts
                .filter((post) => post.type === "video")
                .map((post) => (
                  <div key={post.id} className="aspect-[9/16] relative group cursor-pointer">
                    <Image
                      src={post.image}
                      alt={`Video ${post.id}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="lg" className="rounded-full">
                        <Video size={24} />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved items yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
