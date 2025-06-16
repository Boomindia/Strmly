import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"

interface User {
  id: string
  name: string
  username: string
  avatar: string
  isVerified: boolean
}

interface UserListProps {
  userId: string
  type: "followers" | "following"
}

export default function UserList({ userId, type }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const { user } = useAuthStore()

  const fetchUsers = async () => {
    try {
      const data = type === "followers" 
        ? await api.getFollowers(userId, page)
        : await api.getFollowing(userId, page)

      if (data.length === 0) {
        setHasMore(false)
        return
      }

      const newUsers = data.map((item: any) => ({
        id: item.user.id,
        name: item.user.name,
        username: item.user.username,
        avatar: item.user.avatar || "/placeholder.svg",
        isVerified: item.user.isVerified || false
      }))
      
      // Filter out duplicate users
      setUsers(prev => {
        const existingIds = new Set(prev.map((u: User) => u.id))
        const uniqueNewUsers = newUsers.filter((u: User) => !existingIds.has(u.id))
        return [...prev, ...uniqueNewUsers]
      })

      // Check following status for each user
      const followingStatuses = await Promise.all(
        newUsers.map(async (u: User) => {
          if (u.id === user?.id) return { id: u.id, isFollowing: false }
          const isFollowing = await api.isFollowing(user?.id || "", u.id)
          return { id: u.id, isFollowing }
        })
      )

      setFollowingMap(prev => ({
        ...prev,
        ...Object.fromEntries(followingStatuses.map(s => [s.id, s.isFollowing]))
      }))
    } catch (err) {
      console.error(`Error fetching ${type}:`, err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [userId, type, page])

  const handleFollow = async (targetUserId: string) => {
    try {
      const result = await api.followUser(targetUserId)
      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: result.following
      }))
    } catch (err) {
      console.error("Error following user:", err)
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No {type} yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{user.name}</span>
                {user.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          {user.id !== useAuthStore.getState().user?.id && (
            <Button
              variant={followingMap[user.id] ? "outline" : "default"}
              size="sm"
              onClick={() => handleFollow(user.id)}
            >
              {followingMap[user.id] ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      ))}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="ghost"
            onClick={() => setPage(prev => prev + 1)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
} 