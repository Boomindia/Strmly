"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Maximize, Users, MoreVertical, ChevronDown, Link as LinkIcon} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CommentsSection from "./CommentsSection"
import VideoMoreMenu from "./VideoMoreMenu"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/lib/api"

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

interface Video {
  _id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  type: "SHORT" | "LONG"
  status: "DRAFT" | "PROCESSING" | "PUBLISHED" | "FAILED" | "PRIVATE"
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  likes: number
  comments: number
  shares: number
  views: number
  saves: number
  progress?: number
  community?: string
  series?: string
  currentEpisode?: number
  episodes?: Array<{
    id: number
    title: string
    duration: string
  }>
  tags?: string[]
  isLiked: boolean
}

export default function VideoFeed({ showMixedContent = false, longVideoOnly = false }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState(0)
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [showShareOptions, setShowShareOptions] = useState(false)
  const token = useAuthStore((state) => state.token)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const commentsRef = useRef<HTMLDivElement>(null)
  const shareOptionsRef = useRef<HTMLDivElement>(null)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (!token) {
          console.error("No authentication token found")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }
        const data = await response.json()
        
        // Transform the data to match the Video interface
        const transformedVideos = data.map((video: any) => ({
          _id: video._id,
          title: video.title,
          description: video.description || "",
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl || "",
          type: video.type,
          status: video.status || "PUBLISHED",
          user: {
            id: video.userId,
            name: video.user?.name || "Anonymous",
            username: video.user?.username || "@anonymous",
            avatar: video.user?.avatar || "/placeholder.svg"
          },
          likes: video.likesCount || 0,
          comments: video.commentsCount || 0,
          shares: video.sharesCount || 0,
          views: video.viewsCount || 0,
          saves: 0,
          progress: 0,
          isLiked: video.isLiked || false
        }))
        setVideos(transformedVideos)

        // Check following status for each user
        const followingStatuses = await Promise.all(
          transformedVideos.map(async (v: Video) => {
            if (v.user.id === user?.id) return { id: v.user.id, isFollowing: false }
            const isFollowing = await api.isFollowing(user?.id || "", v.user.id)
            return { id: v.user.id, isFollowing }
          })
        )

        setFollowingMap(prev => ({
          ...prev,
          ...Object.fromEntries(followingStatuses.map(s => [s.id, s.isFollowing]))
        }))
      } catch (error) {
        console.error("Error fetching videos:", error)
      }
    }

    fetchVideos()
  }, [token, user?.id])

  const filteredVideos = longVideoOnly 
    ? videos.filter(video => video.type === "LONG" && video.status === "PUBLISHED")
    : videos.filter(video => video.status === "PUBLISHED")

  const handleVideoAction = async (action: string, videoId: string) => {
    if (!token) {
      console.error("No authentication token found")
      return
    }

    if (action === "like") {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/like`, {
          method: 'POST',
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })

        if (!response.ok) {
          throw new Error("Failed to toggle like")
        }

        const data = await response.json()
        
        // Update the video's like count and liked state
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video._id === videoId 
              ? { 
                  ...video, 
                  likes: data.liked ? video.likes + 1 : video.likes - 1,
                  isLiked: data.liked 
                }
              : video
          )
        )
      } catch (error) {
        console.error("Error toggling like:", error)
      }
    } else if (action === "comment") {
      setSelectedVideoId(videoId)
      setShowComments(true)
    } else if (action === "more") {
      setSelectedVideoId(videoId)
      setShowMoreMenu(true)
    } else {
      console.log(`${action} video ${videoId}`)
    }
  }

  const handleFullscreen = async () => {
    const currentVideoEl = videoRefs.current[currentVideo]
    if (!currentVideoEl) return

    try {
      if (!isFullscreen) {
        // Request fullscreen on the video element
        if (currentVideoEl.requestFullscreen) {
          await currentVideoEl.requestFullscreen()
        } else if ((currentVideoEl as any).webkitRequestFullscreen) {
          await (currentVideoEl as any).webkitRequestFullscreen()
        } else if ((currentVideoEl as any).mozRequestFullScreen) {
          await (currentVideoEl as any).mozRequestFullScreen()
        } else if ((currentVideoEl as any).msRequestFullscreen) {
          await (currentVideoEl as any).msRequestFullscreen()
        }
        setIsFullscreen(true)
        
        // Lock orientation to landscape when entering fullscreen
        if (typeof screen !== 'undefined' && screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape')
          } catch (error) {
            console.log('Orientation lock not supported')
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
        setIsFullscreen(false)
        
        // Unlock orientation when exiting fullscreen
        if (typeof screen !== 'undefined' && screen.orientation) {
          try {
            await (screen.orientation as any).unlock()
          } catch (error) {
            console.log('Orientation unlock not supported')
          }
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  // Add video playback state management
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause all videos when page is not visible
        videoRefs.current.forEach((video) => {
          if (video) {
            video.pause()
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Handle video intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.log('Auto-play prevented:', error)
            })
          } else {
            video.pause()
          }
        })
      },
      {
        threshold: 0.5,
      }
    )

    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video)
      }
    })

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          observer.unobserve(video)
        }
      })
    }
  }, [videos])

  const handleShare = (platform: string, videoId: string) => {
    const videoUrl = `https://strmly.app/video/${videoId}`
    console.log(`Sharing to ${platform}:`, videoUrl)

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

  const copyLink = (videoId: string) => {
    const videoUrl = `https://strmly.app/video/${videoId}`
    navigator.clipboard.writeText(videoUrl)
    console.log("Link copied to clipboard")
  }

  const togglePlay = (videoId: string, index: number) => {
    const videoEl = videoRefs.current[index]
    if (videoEl) {
      if (playingStates[videoId]) {
        videoEl.pause()
      } else {
        videoEl.play().catch((error) => {
          console.log('Play prevented:', error)
        })
      }
    }
  }

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close comments section
      if (commentsRef.current && !commentsRef.current.contains(event.target as Node)) {
        setShowComments(false)
      }

      // Close share options
      if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target as Node)) {
        setShowShareOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleFollow = async (targetUserId: string) => {
    try {
      const result = await api.followUser(targetUserId)
      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: result.following
      }))
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  return (
    <>
      <div className={`h-screen overflow-y-scroll snap-y snap-mandatory ${isFullscreen ? "fullscreen-video" : ""} pt-14`}>
        {filteredVideos.map((video, index) => (
          <div key={video._id} className="h-screen snap-start relative bg-black">
            {/* Video Background */}
            <div className="absolute inset-0">
              <video
                ref={(el) => {
                  videoRefs.current[index] = el
                }}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className={`w-full h-full object-cover ${
                  isFullscreen ? 'object-contain' : ''
                }`}
                loop
                playsInline
                onPlay={() => setPlayingStates(prev => ({ ...prev, [video._id]: true }))}
                onPause={() => setPlayingStates(prev => ({ ...prev, [video._id]: false }))}
              />

              {/* Video Progress Bar */}
              <div className="video-progress">
                <div className="video-progress-bar" style={{ width: `${video.progress || 0}%` }}></div>
              </div>

              {/* Play/Pause overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => togglePlay(video._id, index)}
                  className="text-white/80 hover:text-white hover:bg-black/20"
                >
                  {playingStates[video._id] ? <Pause size={48} /> : <Play size={48} />}
                </Button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="video-actions">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("like", video._id)}
                  className={`text-white hover:bg-black/20 rounded-full p-3 ${
                    video.isLiked ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                >
                  <Heart size={28} className={video.isLiked ? 'fill-current' : ''} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.likes > 1000 ? `${(video.likes / 1000).toFixed(0)}K` : video.likes}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("comment", video._id)}
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
                    setSelectedVideoId(video._id)
                    setShowShareOptions(!showShareOptions)
                  }}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <Share size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">{video.shares}</span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleVideoAction("save", video._id)}
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
                  onClick={() => handleVideoAction("more", video._id)}
                  className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                >
                  <MoreVertical size={28} />
                </Button>
              </div>

              {/* Fullscreen button for long videos */}
              {video.type === "LONG" && (
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleFullscreen}
                    className="text-white hover:text-primary hover:bg-black/20 rounded-full p-3"
                  >
                    <Maximize size={28} />
                  </Button>
                </div>
              )}

              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={video.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{video.user?.name[0]}</AvatarFallback>
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
                    {video.community && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary">
                        <Users size={12} className="mr-1" />
                        {video.community}
                      </Badge>
                    )}

                    {/* Paid Dropdown */}
                    {/* <DropdownMenu>
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
                    </DropdownMenu> */}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  {video.series && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white">
                      <Users size={12} className="mr-1" />
                      {video.series}
                    </Badge>
                  )}
                  {/* Episode Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                        Ep - {video.currentEpisode}
                        <ChevronDown size={12} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-64">
                      {video.episodes?.map((episode) => (
                        <DropdownMenuItem key={episode.id} className="flex justify-between">
                          <span>{episode.title}</span>
                          <span className="text-muted-foreground">{episode.duration}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">{video.user.name}</span>
                {video.user.id && video.user.id !== user?.id && (
                  <Button
                    size="sm"
                    variant={followingMap[video.user.id] ? "outline" : "default"}
                    className={`${
                      followingMap[video.user.id]
                        ? "bg-transparent border border-white text-white hover:bg-white hover:text-black"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                    onClick={() => handleFollow(video.user.id)}
                  >
                    {followingMap[video.user.id] ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-bold mb-2">{video.title}</h3>
              <div className="mb-2">
                <p className={`${!showFullDescription && 'line-clamp-2'}`}>
                  {video.description}
                </p>
                {video.description && video.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-sm text-white/80 hover:text-white mt-1"
                  >
                    {showFullDescription ? 'Show less' : 'more'}
                  </button>
                )}
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {video.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-sm text-white/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comments Section */}
      <div ref={commentsRef}>
        <CommentsSection isOpen={showComments} onClose={() => setShowComments(false)} videoId={selectedVideoId} />
      </div>

      {/* Share Options */}
      {showShareOptions && selectedVideoId && (
        <div ref={shareOptionsRef} className="fixed right-16 top-1/2 transform -translate-y-1/2 bg-background rounded-lg shadow-lg p-4 space-y-4 min-w-[280px] z-50">
          <Button variant="ghost" className="w-full justify-start" onClick={() => copyLink(selectedVideoId)}>
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
                onClick={() => handleShare(platform.name, selectedVideoId)}
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

      {/* Video More Menu */}
      <VideoMoreMenu isOpen={showMoreMenu} onClose={() => setShowMoreMenu(false)} videoId={selectedVideoId} />
    </>
  )
}