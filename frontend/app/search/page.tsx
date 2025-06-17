"use client"

import { useState } from "react"
import { Search, TrendingUp, Hash, Users, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

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
    bio: "Technology enthusiast and educator",
  },
  {
    name: "Startup Mentor",
    username: "@startupmentor",
    avatar: "/placeholder.svg?height=40&width=40",
    followers: "89K",
    isVerified: false,
    bio: "Helping startups grow and scale",
  },
]

const searchResults = {
  videos: [
    {
      id: 1,
      title: "Building a Startup from Scratch",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "15:42",
      views: "125K",
      user: { name: "Tech Creator", avatar: "/placeholder.svg?height=32&width=32" },
      timestamp: "2 days ago",
    },
    {
      id: 2,
      title: "React vs Next.js Comparison",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "12:30",
      views: "89K",
      user: { name: "Code Master", avatar: "/placeholder.svg?height=32&width=32" },
      timestamp: "1 week ago",
    },
  ],
  users: suggestedUsers,
  hashtags: trendingHashtags,
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({
    duration: "all",
    uploadTime: "all",
    sortBy: "relevance",
    category: "all",
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Perform search API call
    console.log("Searching for:", query, "with filters:", filters)
  }

  const clearFilters = () => {
    setFilters({
      duration: "all",
      uploadTime: "all",
      sortBy: "relevance",
      category: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "all" && value !== "relevance")

  return (
    <div className="p-4 pb-20 md:pb-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Search for people, hashtags, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
          className="pl-10 pr-12"
        />
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                hasActiveFilters ? "text-primary" : ""
              }`}
            >
              <Filter size={16} />
              {hasActiveFilters && <div className="w-2 h-2 bg-primary rounded-full ml-1" />}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Select value={filters.duration} onValueChange={(value) => setFilters({ ...filters, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All durations</SelectItem>
                    <SelectItem value="short">Under 1 minute</SelectItem>
                    <SelectItem value="medium">1-10 minutes</SelectItem>
                    <SelectItem value="long">Over 10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Upload time</label>
                <Select
                  value={filters.uploadTime}
                  onValueChange={(value) => setFilters({ ...filters, uploadTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="hour">Last hour</SelectItem>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort by</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="recent">Upload date</SelectItem>
                    <SelectItem value="views">View count</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear
                </Button>
                <Button onClick={() => setShowFilters(false)} className="flex-1">
                  Apply
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([key, value]) => {
            if (value === "all" || value === "relevance") return null
            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {value}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => setFilters({ ...filters, [key]: key === "sortBy" ? "relevance" : "all" })}
                />
              </Badge>
            )
          })}
        </div>
      )}

      {/* Search Results or Discover */}
      {searchQuery ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Search Results for "{searchQuery}"</h2>
            <span className="text-sm text-muted-foreground">1,234 results</span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Top Results */}
              <div>
                <h3 className="font-semibold mb-3">Top Results</h3>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.videos.slice(0, 2).map((video) => (
                    <Card key={video.id} className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-3">
                        <div className="flex space-x-3">
                          <div className="relative">
                            <Image
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              width={120}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                              {video.duration}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2 mb-1">{video.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={video.user.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{video.user.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{video.user.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {video.views} views • {video.timestamp}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div> */}
              </div>

              {/* Users */}
              <div>
                <h3 className="font-semibold mb-3">Users</h3>
                <div className="space-y-3">
                  {searchResults.users.slice(0, 3).map((user) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
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

            <TabsContent value="videos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.videos.map((video) => (
                  <Card key={video.id} className="cursor-pointer hover:bg-accent">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium line-clamp-2 mb-2">{video.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={video.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{video.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{video.user.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {video.views} views • {video.timestamp}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {searchResults.users.map((user) => (
                <Card key={user.username} className="cursor-pointer hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
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
                          <p className="text-sm text-muted-foreground">{user.bio}</p>
                          <p className="text-sm text-muted-foreground">{user.followers} followers</p>
                        </div>
                      </div>
                      <Button size="sm">Follow</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4">
              {searchResults.hashtags.map((item, index) => (
                <Card key={item.tag} className="cursor-pointer hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Hash size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.tag}</p>
                          <p className="text-sm text-muted-foreground">{item.posts}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
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
              {/* <div className="space-y-3">
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
              </div> */}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="mr-2" size={24} />
                Suggested for You
              </h2>
              {/* <div className="space-y-4">
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
                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                        <p className="text-sm text-muted-foreground">{user.followers} followers</p>
                      </div>
                    </div>
                    <Button size="sm">Follow</Button>
                  </div>
                ))}
              </div> */}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
