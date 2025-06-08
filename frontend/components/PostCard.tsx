"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

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
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {post.user.username} • {post.timestamp}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isFollowing && (
            <Button
              size="sm"
              onClick={() => setIsFollowing(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Follow
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt="Post image"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart size={18} className={isLiked ? "fill-current" : ""} />
            <span className="ml-1">{post.likes + (isLiked ? 1 : 0)}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle size={18} />
            <span className="ml-1">{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share size={18} />
            <span className="ml-1">{post.shares}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaved(!isSaved)}
          className={isSaved ? "text-primary" : ""}
        >
          <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
        </Button>
      </div>
    </div>
  )
}
