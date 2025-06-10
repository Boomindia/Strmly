"use client"

import { useState } from "react"
import { Plus, Users, Crown, Shield, Star, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"

const mockCommunities = [
  {
    id: 1,
    name: "Tech Entrepreneurs",
    description: "A community for tech entrepreneurs to share ideas and network",
    avatar: "/placeholder.svg?height=60&width=60",
    banner: "/placeholder.svg?height=200&width=400",
    members: 12500,
    posts: 1250,
    category: "Business",
    isPrivate: false,
    isJoined: true,
    role: "member",
    tags: ["startup", "technology", "business"],
    owner: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 2,
    name: "React Developers",
    description: "Everything about React development, tips, tricks, and best practices",
    avatar: "/placeholder.svg?height=60&width=60",
    banner: "/placeholder.svg?height=200&width=400",
    members: 8900,
    posts: 890,
    category: "Technology",
    isPrivate: false,
    isJoined: false,
    role: null,
    tags: ["react", "javascript", "frontend"],
    owner: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 3,
    name: "Startup Founders",
    description: "Private community for verified startup founders",
    avatar: "/placeholder.svg?height=60&width=60",
    banner: "/placeholder.svg?height=200&width=400",
    members: 450,
    posts: 234,
    category: "Business",
    isPrivate: true,
    isJoined: false,
    role: null,
    tags: ["startup", "founder", "exclusive"],
    owner: {
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
]

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "Technology", "Business", "Education", "Entertainment", "Lifestyle"]

  const filteredCommunities = mockCommunities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const joinedCommunities = mockCommunities.filter((c) => c.isJoined)

  return (
    <div className="p-4 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Link href="/communities/create">
          <Button>
            <Plus size={16} className="mr-2" />
            Create Community
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="joined">My Communities</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32">
                  <Image
                    src={community.banner || "/placeholder.svg"}
                    alt={community.name}
                    fill
                    className="object-cover"
                  />
                  {community.isPrivate && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Shield size={12} className="mr-1" />
                      Private
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={community.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{community.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{community.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center">
                      <Users size={14} className="mr-1" />
                      {community.members.toLocaleString()} members
                    </span>
                    <span>{community.posts} posts</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {community.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={community.owner.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{community.owner.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">by {community.owner.name}</span>
                    </div>

                    {community.isJoined ? (
                      <Button size="sm" variant="outline">
                        Joined
                      </Button>
                    ) : (
                      <Button size="sm">{community.isPrivate ? "Request" : "Join"}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="space-y-4">
          {joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCommunities.map((community) => (
                <Card key={community.id} className="overflow-hidden">
                  <div className="relative h-32">
                    <Image
                      src={community.banner || "/placeholder.svg"}
                      alt={community.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {community.role === "owner" && (
                        <Badge className="bg-yellow-500">
                          <Crown size={12} className="mr-1" />
                          Owner
                        </Badge>
                      )}
                      {community.role === "admin" && (
                        <Badge className="bg-blue-500">
                          <Shield size={12} className="mr-1" />
                          Admin
                        </Badge>
                      )}
                      {community.role === "moderator" && (
                        <Badge className="bg-green-500">
                          <Star size={12} className="mr-1" />
                          Moderator
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={community.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {community.members.toLocaleString()} members
                      </span>
                      <span>{community.posts} posts</span>
                    </div>

                    <Link href={`/communities/${community.id}`}>
                      <Button className="w-full">View Community</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities yet</h3>
              <p className="text-muted-foreground mb-4">Join communities to connect with like-minded people</p>
              <Button onClick={() => setActiveTab("discover")}>Discover Communities</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCommunities
              .sort((a, b) => b.members - a.members)
              .map((community, index) => (
                <Card key={community.id} className="overflow-hidden">
                  <div className="relative h-32">
                    <Image
                      src={community.banner || "/placeholder.svg"}
                      alt={community.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-orange-500">#{index + 1} Trending</Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={community.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {community.members.toLocaleString()} members
                      </span>
                      <span className="text-green-600">+{Math.floor(Math.random() * 100)} today</span>
                    </div>

                    <Button className="w-full" size="sm">
                      {community.isJoined ? "Joined" : "Join"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
