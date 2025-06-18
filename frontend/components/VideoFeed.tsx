"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Maximize, Users, MoreVertical, ChevronDown, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CommentsSection from "./CommentsSection"
import VideoMoreMenu from "./VideoMoreMenu"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/lib/api"
import { FaWhatsapp, FaInstagram, FaTelegram, FaSnapchat, FaTwitter, FaFacebook } from "react-icons/fa"

// const mockVideos = [
//   {
//     id: 1,
//     type: "long",
//     user: {
//       name: "Tech Creator",
//       username: "@techcreator",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     title: "Building a Startup from Scratch - Complete Guide",
//     description: "Learn how to build a successful startup from the ground up, covering everything from idea validation to funding and scaling. This comprehensive guide will walk you through every step of the process, from ideation to launch.",
//     community: "Startup Community",
//     series: "Entrepreneur Series",
//     episodes: [
//       { id: 1, title: "Episode 1: Getting Started", duration: "15:42" },
//       { id: 2, title: "Episode 2: Market Research", duration: "18:30" },
//       { id: 3, title: "Episode 3: Building MVP", duration: "22:15" },
//       { id: 4, title: "Episode 4: Funding", duration: "19:45" },
//     ],
//     currentEpisode: 1,
//     duration: "15:42",
//     progress: 35,
//     likes: 89500,
//     comments: 892,
//     shares: 234,
//     saves: 1200,
//     videoUrl: "/placeholder.svg?height=800&width=450",
//   },
//   {
//     id: 2,
//     type: "long",
//     user: {
//       name: "Code Master",
//       username: "@codemaster",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     title: "React vs Next.js - Which Should You Choose?",
//     description: "Complete comparison of React and Next.js frameworks, diving deep into their features, performance, and best use cases for modern web development. This is a very comprehensive guide, perfect for developers looking to make informed decisions.",
//     community: "Developer Community",
//     series: "Web Dev Masterclass",
//     episodes: [
//       { id: 1, title: "Episode 1: Introduction", duration: "12:30" },
//       { id: 2, title: "Episode 2: React Basics", duration: "20:15" },
//       { id: 3, title: "Episode 3: Next.js Features", duration: "22:15" },
//       { id: 4: "Episode 4: Performance", duration: "18:45" },
//       { id: 5, title: "Episode 5: Deployment", duration: "16:30" },
//     ],
//     currentEpisode: 3,
//     duration: "22:15",
//     progress: 60,
//     likes: 67000,
//     comments: 445,
//     shares: 123,
//     saves: 890,
//     videoUrl: "/placeholder.svg?height=800&width=450",
//   },
// ]

interface VideoFeedProps {
  showMixedContent?: boolean
  longVideoOnly?: boolean
}

const socialPlatforms = [
  { name: "WhatsApp", icon: FaWhatsapp, color: "text-green-500" },
  { name: "Instagram", icon: FaInstagram, color: "text-pink-500" },
  { name: "Telegram", icon: FaTelegram, color: "text-blue-500" },
  { name: "Snapchat", icon: FaSnapchat, color: "text-yellow-500" },
  { name: "Twitter", icon: FaTwitter, color: "text-blue-400" },
  { name: "Facebook", icon: FaFacebook, color: "text-blue-600" },
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
  createdAt: string // Ensure createdAt is part of the interface
}

// Utility function to truncate description by words
const truncateWords = (text: string, maxWords: number) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};


export default function VideoFeed({ showMixedContent = false, longVideoOnly = false }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>([])
  // currentVideo is no longer directly used for playback logic but can be for other UI purposes.
  const [currentVideo, setCurrentVideo] = useState(0) // Still present, but not used in fullscreen logic anymore
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  // Updated videoRefs to store element and ID
  const videoRefs = useRef<Array<{ element: HTMLVideoElement | null; id: string }>>([])
  const [showShareOptions, setShowShareOptions] = useState(false)
  const token = useAuthStore((state) => state.token)
  const [showFullDescriptionMap, setShowFullDescriptionMap] = useState<Record<string, boolean>>({});
  const commentsRef = useRef<HTMLDivElement>(null)
  const shareOptionsRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const { user } = useAuthStore()

  // Ref to hold the current playingStates, so it's stable within useCallback
  const playingStatesRef = useRef(playingStates);
  useEffect(() => {
    playingStatesRef.current = playingStates;
  }, [playingStates]);

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
          throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        console.log("Raw API response data:", data) // <<<--- CHECK THIS IN CONSOLE

        // Transform the data to match the Video interface
        const transformedVideos = data.map((video: any) => ({
          _id: video._id,
          title: video.title || "Untitled Video", // This line tries to get the title
          description: video.description || "",   // This line tries to get the description
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
          saves: video.savesCount || 0,
          progress: 0,
          isLiked: video.isLiked || false,
          tags: video.tags || [],
          createdAt: video.createdAt,
          community: video.community || null,
          series: video.series || null,
          currentEpisode: video.currentEpisode || 1,
          episodes: video.episodes || []
        }))
        console.log("Transformed videos data (check title/description here):", transformedVideos) // <<<--- CHECK THIS IN CONSOLE
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

  // CORRECTED: handleFullscreen now uses playingStatesRef to find the active video
  const handleFullscreen = async () => {
    const currentlyPlayingVideoRef = videoRefs.current.find(ref => playingStatesRef.current[ref.id]);
    const currentVideoEl = currentlyPlayingVideoRef?.element;

    if (!currentVideoEl) {
      console.log('No video is currently playing to go fullscreen.');
      return;
    }

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
          await (document as any).webkitExitExitFullscreen()
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
        videoRefs.current.forEach((ref) => {
          if (ref.element) {
            ref.element.pause()
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

  // Handle video intersection for auto-play/pause
  const intersectionObserverCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const videoRef = videoRefs.current.find(ref => ref.element === entry.target)
      if (videoRef?.element) {
        if (entry.isIntersecting) {
          // Pause all other currently playing videos before playing the current one
          videoRefs.current.forEach(otherRef => {
            if (otherRef.element && otherRef.id !== videoRef.id && playingStatesRef.current[otherRef.id]) {
              otherRef.element.pause();
              setPlayingStates(prev => ({ ...prev, [otherRef.id]: false }));
            }
          });

          videoRef.element.play().catch(error => {
            // Handle potential autoplay blocking (e.g., if muted attribute is not present)
            console.log('Autoplay prevented:', error);
          });
          setPlayingStates(prev => ({ ...prev, [videoRef.id]: true }));
        } else {
          // Video is no longer intersecting, pause it
          videoRef.element.pause();
          setPlayingStates(prev => ({ ...prev, [videoRef.id]: false }));
        }
      }
    });
  }, [setPlayingStates]); // setPlayingStates is a stable reference

  useEffect(() => {
    const observer = new IntersectionObserver(intersectionObserverCallback, {
      threshold: 0.5, // Trigger when 50% of the video is visible
    })

    videoRefs.current.forEach((ref) => {
      if (ref.element) {
        observer.observe(ref.element)
      }
    })

    return () => {
      videoRefs.current.forEach((ref) => {
        if (ref.element) {
          observer.unobserve(ref.element)
        }
      })
      observer.disconnect()
    }
  }, [filteredVideos, intersectionObserverCallback]) // Re-run if filteredVideos change


  const handleShare = (platform: string, videoId: string) => {
    const videoUrl = `https://strmly.com/video/${videoId}`
    const shareText = "Check out this video on Strmly!"

    switch (platform.toLowerCase()) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + videoUrl)}`)
        break
      case "telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(shareText)}`)
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(videoUrl)}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`)
        break
      case "instagram":
        // Instagram doesn't support direct sharing via URL
        copyLink(videoId)
        alert("Instagram doesn't support direct sharing. Link copied to clipboard!")
        break
      case "snapchat":
        // Snapchat doesn't support direct sharing via URL
        copyLink(videoId)
        alert("Snapchat doesn't support direct sharing. Link copied to clipboard!")
        break
      default:
        copyLink(videoId)
    }
  }

  const copyLink = (videoId: string) => {
    const videoUrl = `https://strmly.com/video/${videoId}`
    navigator.clipboard.writeText(videoUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
  }

  // Modified togglePlay to handle pausing other videos
  const togglePlay = (videoId: string, index: number) => {
    const videoRef = videoRefs.current[index]; // Get the ref object for the clicked video
    if (videoRef?.element) {
      if (playingStates[videoId]) {
        // If it's currently playing, pause it
        videoRef.element.pause();
        setPlayingStates(prev => ({ ...prev, [videoId]: false }));
      } else {
        // If it's paused, play it and pause others
        videoRefs.current.forEach((ref) => {
          if (ref.element && ref.id !== videoId && playingStates[ref.id]) {
            ref.element.pause();
            setPlayingStates(prev => ({ ...prev, [ref.id]: false }));
          }
        });
        videoRef.element.play().catch((error) => {
          console.log('Play prevented:', error)
        });
        setPlayingStates(prev => ({ ...prev, [videoId]: true }));
      }
    }
  }

  // Add click outside handler for comments, share options, AND description
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

      // Collapse description if clicked outstide
      if (descriptionRef.current) {
        // Check if any description is currently expanded
        const isAnyDescriptionExpanded = Object.values(showFullDescriptionMap).some(Boolean);
        // If a description is expanded AND the click is outside the descriptionRef
        if (isAnyDescriptionExpanded && !descriptionRef.current.contains(event.target as Node)) {
          setShowFullDescriptionMap({});
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFullDescriptionMap])


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

  const toggleFullDescription = (videoId: string) => {
    setShowFullDescriptionMap(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const DEFAULT_WORD_LIMIT = 7;

  return (
    <>
      {/* Increased padding-bottom to account for mobile nav */}
      <div className={`h-screen overflow-y-scroll snap-y snap-mandatory ${isFullscreen ? "fullscreen-video" : ""} pt-14 pb-16`}>
        {filteredVideos.map((video, index) => (
          <div key={video._id} className="h-screen snap-start relative bg-black">
            {/* Video Background */}
            <div className="absolute inset-0">
              <video
                ref={(el) => {
                  if (el) { // Ensure element exists before assigning
                    videoRefs.current[index] = { element: el, id: video._id };
                  }
                }}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className={`w-full h-full object-cover ${isFullscreen ? 'object-contain' : ''}`}
                loop
                playsInline
                onPlay={() => setPlayingStates(prev => ({ ...prev, [video._id]: true }))}
                onPause={() => setPlayingStates(prev => ({ ...prev, [video._id]: false }))}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default video controls if any
                  togglePlay(video._id, index);
                }}
              />

              {/* Video Progress Bar */}
              <div className="video-progress">
                <div className="video-progress-bar" style={{ width: `${video.progress || 0}%` }}></div>
              </div>

              {/* Play/Pause overlay buttons */}
              {!playingStates[video._id] && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white/80 hover:text-white hover:bg-black/20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event from bubbling to video element's onClick
                        togglePlay(video._id, index);
                      }}
                    >
                      <Play size={48} />
                    </Button>
                 </div>
              )}
              {playingStates[video._id] && ( // Added this block for Pause icon
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white/80 hover:text-white hover:bg-black/20 pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event from bubbling to video element's onClick
                        togglePlay(video._id, index);
                      }}
                    >
                      <Pause size={48} />
                    </Button>
                 </div>
              )}
            </div>

            {/* Right Side Actions - Reverted icon/button sizes and reduced space-y */}
            <div className="video-actions flex flex-col items-center justify-end h-full py-4 space-y-1">
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => handleVideoAction("like", video._id)}
                  className={`bg-transparent text-white rounded-full hover:bg-transparent ${video.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart size={28} className={video.isLiked ? 'fill-current' : ''} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.likes > 1000 ? `${(video.likes / 1000).toFixed(0)}K` : video.likes}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  onClick={() => handleVideoAction("comment", video._id)}
                  className="bg-transparent text-white hover:text-primary rounded-full hover:bg-transparent"
                >
                  <MessageCircle size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">
                  {video.comments > 1000 ? `${(video.comments / 1000).toFixed(1)}K` : video.comments}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  onClick={() => {
                    setSelectedVideoId(video._id)
                    setShowShareOptions(!showShareOptions)
                  }}
                  className="bg-transparent text-white hover:text-primary rounded-full hover:bg-transparent"
                >
                  <Share size={28} />
                </Button>
                <span className="text-white text-sm font-medium mt-1">{video.shares}</span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  onClick={() => handleVideoAction("save", video._id)}
                  className="bg-transparent text-white hover:text-primary rounded-full hover:bg-transparent"
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
                  onClick={() => handleVideoAction("more", video._id)}
                  className="bg-transparent text-white hover:text-primary hover:bg-transparent"
                >
                  <MoreVertical size={28} />
                </Button>
              </div>

              {/* Fullscreen button for long videos */}
              {video.type === "LONG" && (
                <div className="flex flex-col items-center">
                  <Button
                    onClick={handleFullscreen}
                    className="bg-transparent text-white hover:text-primary rounded-full"
                  >
                    <Maximize size={28} />
                  </Button>
                </div>
              )}

              {/* Profile Avatar - Remains with mt-4 */}
              <div className="relative mt-4">
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
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 sm:pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent max-h-[50vh] overflow-y-auto">
              {/* Community and Series Info */}
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {video.community && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary">
                        <Users size={12} className="mr-1" />
                        {video.community}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {video.series && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white">
                      <Users size={12} className="mr-1" />
                      {video.series}
                    </Badge>
                  )}
                  {/* Episode Dropdown (re-enabled if needed) */}
                  {/* {video.type === "LONG" && video.episodes && video.episodes.length > 0 && (
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
                  )} */}
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-white">{video.user.name}</span>
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
              <h3 className="text-lg font-bold mb-1 text-white">{video.title}</h3>
              <div className="mb-1" ref={descriptionRef}>
                <p className="text-white/90">
                  {showFullDescriptionMap[video._id] ? video.description : truncateWords(video.description, DEFAULT_WORD_LIMIT)}
                </p>
                {/* Show more button if the number of words exceeds the actual limit*/}
                {video.description && video.description.split(/\s+/).length > DEFAULT_WORD_LIMIT && (
                  <button
                    onClick={() => toggleFullDescription(video._id)}
                    className="text-sm text-white/80 hover:text-white mt-1"
                  >
                    {showFullDescriptionMap[video._id] ? 'Show less' : 'more'}
                  </button>
                )}
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, tagIndex) => ( // Changed index to tagIndex to avoid conflict
                    <span
                      key={tagIndex}
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
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => copyLink(selectedVideoId)}
          >
            <LinkIcon size={16} className="mr-2" />
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>

          <div className="grid grid-cols-3 gap-4">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform.name.toLowerCase(), selectedVideoId)}
                className="flex flex-col items-center space-y-1"
              >
                <platform.icon className={`w-8 h-8 ${platform.color}`} />
                <span className="text-white text-xs">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video More Menu */}
      <VideoMoreMenu isOpen={showMoreMenu} onClose={() => setShowMoreMenu(false)} videoId={selectedVideoId} />
    </>
  )
}

