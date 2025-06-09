"use client"

import { useState, useRef } from "react"
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Play,
  Pause,
  Maximize,
  Users,
  MoreVertical,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CommentsSection from "./CommentsSection"
import VideoMoreMenu from "./VideoMoreMenu"

const mockVideos = [
  {
    id: 1,
    type: "long",
    user: {
      name: "Tech Creator",
      username: "@techcreator",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    title: "Building a Startup from Scratch - Complete Guide",
    description: "Learn how to build a successful startup from the ground up",
    community: "Startup Community",
    series: "Entrepreneur Series",
    episodes: [
      { id: 1, title: "Episode 1: Getting Started", duration: "15:42" },
      { id: 2, title: "Episode 2: Market Research", duration: "18:30" },
      { id: 3, title: "Episode 3: Building MVP", duration: "22:15" },
      { id: 4, title: "Episode 4: Funding", duration: "19:45" },
    ],
    currentEpisode: 1,
    duration: "15:42",
    progress: 35,
    likes: 89500,
    comments: 892,
    shares: 234,
    saves: 1200,
    videoUrl: "/placeholder.svg?height=800&width=450",
  },
  {
    id: 2,
    type: "long",
    user: {
      name: "Code Master",
      username: "@codemaster",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    title: "React vs Next.js - Which Should You Choose?",
    description: "Complete comparison of React and Next.js frameworks",
    community: "Developer Community",
    series: "Web Dev Masterclass",
    episodes: [
      { id: 1, title: "Episode 1: Introduction", duration: "12:30" },
      { id: 2, title: "Episode 2: React Basics", duration: "20:15" },
      { id: 3, title: "Episode 3: Next.js Features", duration: "22:15" },
      { id: 4, title: "Episode 4: Performance", duration: "18:45" },
      { id: 5, title: "Episode 5: Deployment", duration: "16:30" },
    ],
    currentEpisode: 3,
    duration: "22:15",
    progress: 60,
    likes: 67000,
    comments: 445,
    shares: 123,
    saves: 890,
    videoUrl: "/placeholder.svg?height=800&width=450",
  },
]

interface VideoFeedProps {
  showMixedContent?: boolean
  longVideoOnly?: boolean
}

const socialPlatforms = [
  { name: "WhatsApp", icon: "��", color: "bg-green-500" },
  { name: "Instagram", icon: "📷", color: "bg-pink-500" },
  { name: "Telegram", icon: "✈️", color: "bg-blue-500" },
  { name: "Snapchat", icon: "👻", color: "bg-yellow-500" },
  { name: "Twitter", icon: "🐦", color: "bg-blue-400" },
  { name: "Facebook", icon: "📘", color: "bg-blue-600" },
]

export default function VideoFeed({ showMixedContent = false, longVideoOnly = false }: VideoFeedProps) {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [showShareOptions, setShowShareOptions] = useState(false)

  const filteredVideos = longVideoOnly ? mockVideos : mockVideos

  const handleVideoAction = (action: string, videoId: number) => {
    if (action === "comment") {
      setSelectedVideoId(videoId)
      setShowComments(true)
    } else if (action === "more") {
      setSelectedVideoId(videoId)
      setShowMoreMenu(true)
    } else {
      console.log(`${action} video ${videoId}`)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleShare = (platform: string, videoId: number) => {
    const videoUrl = `https://strmly.app/video/${videoId}`
    console.log(`Sharing to ${platform}:`, videoUrl)

    //integrate with each platform's sharing API
    if (platform === "WhatsApp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(videoUrl)}`)
    }
    else if (platform === "Telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(videoUrl)}`)
    }
    else if (platform === "Twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}`)
    }
  }

  const copyLink = (videoId: number) => {
    const videoUrl = `https://strmly.app/video/${videoId}`
    navigator.clipboard.writeText(videoUrl)
    console.log("Link copied to clipboard")
  }

  return (
    <>
      <div className={`h-screen overflow-y-scroll snap-y snap-mandatory ${isFullscreen ? "fullscreen-video" : ""} pt-14`}>
        {filteredVideos.map((video, index) => (
          <div key={video.id} className="h-screen snap-start relative bg-black">
            {/* Video Background */}
            <div className="absolute inset-0">
              <img
                src={video.videoUrl || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />

              {/* Video Progress Bar */}
              <div className="video-progress">
                <div className="video-progress-bar" style={{ width: `${video.progress}%` }}></div>
              </div>

              {/* Play/Pause overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white/80 hover:text-white hover:bg-black/20"
                >
                  {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                </Button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="video-actions">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("like", video.id)}
                  className="text-white hover:text-red-500 hover:bg-black/20 rounded-full p-3"
                >
                  <Heart size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.likes > 1000 ? `${(video.likes / 1000).toFixed(0)}K` : video.likes}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("comment", video.id)}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <MessageCircle size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.comments > 1000 ? `${(video.comments / 1000).toFixed(1)}K` : video.comments}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setSelectedVideoId(video.id)
                    setShowShareOptions(!showShareOptions)
                  }}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <Share size={28} />
                </Button>
                {showShareOptions && selectedVideoId === video.id && (
                  <div className="absolute right-16 top-0 bg-background rounded-lg shadow-lg p-4 space-y-4 min-w-[280px]">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => copyLink(video.id)}>
                      <LinkIcon size={16} className="mr-2" />
                      Copy Link
                    </Button>

                    <div className="grid grid-cols-3 gap-4">
                      {socialPlatforms.map((platform) => (
                        <Button
                          key={platform.name}
                          variant="outline"
                          size="sm"
                          className="flex flex-col items-center p-4 h-auto hover:bg-accent"
                          onClick={() => handleShare(platform.name, video.id)}
                        >
                          <div
                            className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center text-white mb-2`}
                          >
                            <span className="text-base">{platform.icon}</span>
                          </div>
                          <span className="text-xs font-medium">{platform.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <span className="text-white text-sm font-medium mt-1">{video.shares}</span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("save", video.id)}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <Bookmark size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.saves > 1000 ? `${(video.saves / 1000).toFixed(1)}K` : video.saves}
                </span>
              </div>

              {/* More Menu */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("more", video.id)}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <MoreVertical size={28} />
                </Button>
              </div>

              {/* Fullscreen button for long videos */}
              {video.type === "long" && (
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={toggleFullscreen}
                    className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                  >
                    <Maximize size={28} />
                  </Button>
                </div>
              )}

              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={video.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{video.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">+</span>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="long-video-overlay">
              {/* Community and Series Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary">
                      <Users size={12} className="mr-1" />
                      {video.community}
                    </Badge>

                    {/* Paid Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="bg-green-500/20 text-green-400 border-green-500">
                        Paid
                        <ChevronDown size={12} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="end" className="w-56">
                      <DropdownMenuItem>
                        <div className="flex flex-col">
                          <span className="font-medium">Full Series</span>
                          <span className="text-sm text-muted-foreground">Rs 29</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex flex-col">
                          <span className="font-medium">Creator Access</span>
                          <span className="text-sm text-muted-foreground">Rs 99/month</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex flex-col">
                          <span className="font-medium">STRMLY Pass</span>
                          <span className="text-sm text-muted-foreground">Rs 199/month</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white">
                      <Users size={12} className="mr-1" />
                      {video.series}
                    </Badge>
                  {/* Episode Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                        Ep - {video.currentEpisode}
                        <ChevronDown size={12} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-64">
                      {video.episodes.map((episode) => (
                        <DropdownMenuItem key={episode.id} className="flex justify-between">
                          <span>{episode.title}</span>
                          <span className="text-muted-foreground">{episode.duration}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2">{video.title}</h3>

              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">{video.user.name}</span>
                <Button
                  size="sm"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-black"
                >
                  Follow
                </Button>
              </div>

              <p className="mb-2">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Section */}
      <CommentsSection isOpen={showComments} onClose={() => setShowComments(false)} videoId={selectedVideoId} />

      {/* Video More Menu */}
      <VideoMoreMenu isOpen={showMoreMenu} onClose={() => setShowMoreMenu(false)} videoId={selectedVideoId} />
    </>
  )
}