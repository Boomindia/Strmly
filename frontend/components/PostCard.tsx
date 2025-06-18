"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Post {
  id: number
  user: {
    name: string
    username: string
    avatar: string
    isFollowing: boolean
  }
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
}

export default function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(post.user.isFollowing)

  return (
    <div className="bg-card border border-border rounded-lg p-3 lg:p-4 w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
            <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-sm lg:text-base">{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm lg:text-base truncate">{post.user.name}</p>
            <p className="text-xs lg:text-sm text-muted-foreground truncate">
              {post.user.username} • {post.timestamp}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
          {!isFollowing && (
            <Button
              size="sm"
              onClick={() => setIsFollowing(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-2"
            >
              Follow
            </Button>
          )}
          <Button variant="ghost" size="sm" className="p-1 lg:p-2">
            <MoreHorizontal size={16} className="lg:w-5 lg:h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 text-sm lg:text-base leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt="Post image"
            width={600}
            height={400}
            className="w-full h-auto object-cover max-h-96 lg:max-h-[500px]"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              "p-2 lg:p-3 text-sm lg:text-base",
              isLiked ? "text-red-500" : ""
            )}
          >
            <Heart size={16} className={cn("lg:w-5 lg:h-5", isLiked ? "fill-current" : "")} />
            <span className="ml-1 lg:ml-2">{post.likes + (isLiked ? 1 : 0)}</span>
          </Button>
          <Button variant="ghost" size="sm" className="p-2 lg:p-3 text-sm lg:text-base">
            <MessageCircle size={16} className="lg:w-5 lg:h-5" />
            <span className="ml-1 lg:ml-2">{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="p-2 lg:p-3 text-sm lg:text-base">
            <Share size={16} className="lg:w-5 lg:h-5" />
            <span className="ml-1 lg:ml-2">{post.shares}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "p-2 lg:p-3 text-sm lg:text-base",
            isSaved ? "text-primary" : ""
          )}
        >
          <Bookmark size={16} className={cn("lg:w-5 lg:h-5", isSaved ? "fill-current" : "")} />
        </Button>
      </div>
    </div>
  )
}
