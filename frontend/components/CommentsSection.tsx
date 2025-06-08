"use client"

import { useState } from "react"
import { X, Send, Smile, Heart, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

const emojis = ["😀", "😂", "😍", "🔥", "💯", "👍", "❤️", "🎉", "🚀", "💪", "👏", "🙌"]

interface CommentsSectionProps {
  isOpen: boolean
  onClose: () => void
  videoId: number | null
}

export default function CommentsSection({ isOpen, onClose, videoId }: CommentsSectionProps) {
  const [comment, setComment] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSendComment = () => {
    if (comment.trim()) {
      console.log("Sending comment:", comment)
      setComment("")
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
        {mockComments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            {/* Main Comment */}
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="text-sm">{comment.content}</p>

                <div className="flex items-center space-x-4 mt-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Heart size={12} className="mr-1" />
                    {comment.likes}
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

            {/* Replies */}
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex space-x-3 ml-8">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={reply.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-xs">{reply.user.name}</span>
                    <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                  </div>
                  <p className="text-xs">{reply.content}</p>

                  <div className="flex items-center space-x-4 mt-1">
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-xs">
                      <Heart size={10} className="mr-1" />
                      {reply.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 px-2 text-xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>You</AvatarFallback>
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
            />

            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <div className="relative">
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

              <Button size="sm" onClick={handleSendComment} disabled={!comment.trim()} className="h-6 w-6 p-0">
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

