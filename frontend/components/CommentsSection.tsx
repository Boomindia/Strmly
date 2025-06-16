"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Smile, Heart, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"

const mockComments = [
  {
    id: 1,
    user: {
      name: "John Doe",
      username: "@johndoe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content: "This is such an amazing video! Really helpful content 🔥",
    likes: 24,
    timestamp: "2h ago",
    replies: [
      {
        id: 11,
        user: {
          name: "Jane Smith",
          username: "@janesmith",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content: "I totally agree! The explanation was so clear.",
        likes: 5,
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: 2,
    user: {
      name: "Tech Enthusiast",
      username: "@techenthusiast",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content: "Can you make a video on advanced React patterns next?",
    likes: 18,
    timestamp: "3h ago",
    replies: [],
  },
  {
    id: 3,
    user: {
      name: "Developer Pro",
      username: "@devpro",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    content: "The code examples were perfect! Thanks for sharing 💯",
    likes: 31,
    timestamp: "5h ago",
    replies: [],
  },
]

const emojis = ["😀", "😂", "😍", "🔥", "💯", "👍", "❤️", "🎉", "🚀", "💪", "��", "🙌"]

interface Comment {
  _id: string
  content: string
  userId: string
  videoId: string
  parentId?: string
  likesCount: number
  repliesCount: number
  isEdited: boolean
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
    isVerified: boolean
  }
  isLiked?: boolean
}

interface CommentsSectionProps {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
}

export default function CommentsSection({ isOpen, onClose, videoId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [comment, setComment] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const token = useAuthStore((state) => state.token)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments()
    }
  }, [isOpen, videoId])

  // Add click outside handler for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchComments = async () => {
    if (!token || !videoId) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`, {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSendComment = async () => {
    if (!token || !videoId || !comment.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comment`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const newComment = await response.json()
      setComments(prev => [newComment, ...prev])
      setComment("")
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!token || !videoId) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments/${commentId}/like`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      if (!response.ok) {
        throw new Error("Failed to like comment")
      }

      const data = await response.json()
      
      // Update the comment's like count and liked state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { 
                ...comment, 
                likesCount: data.liked ? comment.likesCount + 1 : comment.likesCount - 1,
                isLiked: data.liked 
              }
            : comment
        )
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const addEmoji = (emoji: string) => {
    setComment((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  if (!isOpen) return null

  return (
    <div className="comments-section open">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Comments</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="space-y-2">
            {/* Main Comment */}
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{comment.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.user?.name || "Anonymous User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>

                <div className="flex items-center space-x-4 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-6 px-2 text-xs ${comment.isLiked ? 'text-red-500' : ''}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    <Heart size={12} className={`mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likesCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <MoreVertical size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[40px] max-h-[120px] resize-none pr-20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendComment()
                }
              }}
              disabled={isLoading}
            />

            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <div className="relative" ref={emojiPickerRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-6 w-6 p-0"
                >
                  <Smile size={16} />
                </Button>

                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <div className="grid grid-cols-6 gap-1">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addEmoji(emoji)}
                          className="text-lg hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                size="sm" 
                onClick={handleSendComment} 
                disabled={!comment.trim() || isLoading} 
                className="h-6 w-6 p-0"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

