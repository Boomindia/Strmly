"use client"

import { useState } from "react"
import { BarChart3, Users, Eye, Heart, DollarSign, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockAnalytics = {
  totalViews: 125000,
  totalLikes: 8500,
  totalFollowers: 12500,
  totalEarnings: 2450.75,
  monthlyGrowth: {
    views: 15.2,
    likes: 8.7,
    followers: 12.3,
    earnings: 23.1,
  },
}

const mockRecentVideos = [
  {
    id: 1,
    title: "Building a Startup from Scratch",
    views: 15420,
    likes: 892,
    earnings: 125.5,
    uploadDate: "2024-01-15",
  },
  {
    id: 2,
    title: "React vs Next.js Comparison",
    views: 8930,
    likes: 445,
    earnings: 89.3,
    uploadDate: "2024-01-12",
  },
  {
    id: 3,
    title: "Entrepreneur Mindset Tips",
    views: 12100,
    likes: 678,
    earnings: 98.75,
    uploadDate: "2024-01-10",
  },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d")

  return (
    <div className="p-4 pb-20 md:pb-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <BarChart3 size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalViews.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight size={12} className="mr-1" />+{mockAnalytics.monthlyGrowth.views}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalLikes.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight size={12} className="mr-1" />+{mockAnalytics.monthlyGrowth.likes}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalFollowers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight size={12} className="mr-1" />+{mockAnalytics.monthlyGrowth.followers}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalytics.totalEarnings.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight size={12} className="mr-1" />+{mockAnalytics.monthlyGrowth.earnings}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Engagement chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Video Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">Uploaded on {video.uploadDate}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{video.views.toLocaleString()}</p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{video.likes}</p>
                        <p className="text-muted-foreground">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">${video.earnings}</p>
                        <p className="text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Age 18-24</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-16 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Age 25-34</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-20 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm">42%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Age 35-44</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-8 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm">18%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Age 45+</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-3 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["India", "United States", "United Kingdom", "Canada", "Australia"].map((country, index) => (
                    <div key={country} className="flex justify-between items-center">
                      <span>{country}</span>
                      <span className="text-sm text-muted-foreground">{25 - index * 4}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
