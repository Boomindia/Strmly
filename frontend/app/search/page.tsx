"use client"

import { useState } from "react"
import { Search, TrendingUp, Hash, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const trendingHashtags = [
  { tag: "#StartupIndia", posts: "125K posts" },
  { tag: "#TechNews", posts: "89K posts" },
  { tag: "#Innovation", posts: "67K posts" },
  { tag: "#Entrepreneur", posts: "45K posts" },
  { tag: "#AI", posts: "234K posts" },
  { tag: "#WebDev", posts: "156K posts" },
]

const suggestedUsers = [
  {
    name: "Tech Guru",
    username: "@techguru",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "125K",
    isVerified: true,
  },
  {
    name: "Startup Mentor",
    username: "@startupmentor",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "89K",
    isVerified: false,
  },
  {
    name: "Code Master",
    username: "@codemaster",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "67K",
    isVerified: true,
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("trending")

  return (
    <div className="p-4 pb-20 md:pb-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Search for people, hashtags, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results or Discover */}
      {searchQuery ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Search Results for "{searchQuery}"</h2>
          <div className="text-center py-12 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4" />
            <p>No results found. Try searching for something else.</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2" size={24} />
                Trending Hashtags
              </h2>
              <div className="space-y-3">
                {trendingHashtags.map((item, index) => (
                  <div
                    key={item.tag}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Hash size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.tag}</p>
                        <p className="text-sm text-muted-foreground">{item.posts}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="mr-2" size={24} />
                Suggested for You
              </h2>
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">{user.name}</p>
                          {user.isVerified && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.followers} followers</p>
                      </div>
                    </div>
                    <Button size="sm">Follow</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
