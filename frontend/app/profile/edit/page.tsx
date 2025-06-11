"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Globe, Lock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"

export default function EditProfilePage() {
  const [profile, setProfile] = useState({
    name: "Gabar Singh",
    username: "gabar_singh",
    email: "gabar@example.com",
    phone: "+91 98765 43210",
    bio: "Entrepreneur | Tech Enthusiast | Building the future 🚀",
    website: "gabarsingh.com",
    location: "Mumbai, India",
    avatar: "/placeholder.svg?height=120&width=120",
    coverImage: "/placeholder.svg?height=200&width=800",
    isPrivate: false,
    allowComments: true,
    allowDuets: true,
    allowDownloads: false,
    showOnlineStatus: true,
  })

  const [privacy, setPrivacy] = useState({
    whoCanMessage: "everyone",
    whoCanComment: "everyone",
    whoCanDuet: "everyone",
    whoCanViewProfile: "everyone",
  })

  const handleProfileUpdate = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePrivacyUpdate = (field: string, value: any) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving profile:", { profile, privacy })
    // API call to save profile
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Edit Profile</h1>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/40 rounded-t-lg">
                  <Image
                    src={profile.coverImage || "/placeholder.svg"}
                    alt="Cover"
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => console.log("Change cover")}
                  >
                    <Camera size={16} className="mr-2" />
                    Change Cover
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => console.log("Change avatar")}
                    >
                      <Camera size={14} />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">Profile Photo</p>
                    <p className="text-sm text-muted-foreground">
                      This will be displayed on your profile and in comments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleProfileUpdate("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => handleProfileUpdate("username", e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => handleProfileUpdate("website", e.target.value)}
                      placeholder="yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleProfileUpdate("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileUpdate("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            {/* Account Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Account Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Private Account</p>
                    <p className="text-sm text-muted-foreground">Only approved followers can see your content</p>
                  </div>
                  <Switch
                    checked={profile.isPrivate}
                    onCheckedChange={(checked) => handleProfileUpdate("isPrivate", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interaction Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Who Can...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Send you messages</Label>
                  <Select
                    value={privacy.whoCanMessage}
                    onValueChange={(value) => handlePrivacyUpdate("whoCanMessage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2" />
                          Everyone
                        </div>
                      </SelectItem>
                      <SelectItem value="followers">
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" />
                          Followers only
                        </div>
                      </SelectItem>
                      <SelectItem value="nobody">
                        <div className="flex items-center">
                          <Lock size={16} className="mr-2" />
                          Nobody
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Comment on your videos</Label>
                  <Select
                    value={privacy.whoCanComment}
                    onValueChange={(value) => handlePrivacyUpdate("whoCanComment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers only</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duet with your videos</Label>
                  <Select
                    value={privacy.whoCanDuet}
                    onValueChange={(value) => handlePrivacyUpdate("whoCanDuet", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers only</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Content Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Comments</p>
                    <p className="text-sm text-muted-foreground">Let people comment on your videos</p>
                  </div>
                  <Switch
                    checked={profile.allowComments}
                    onCheckedChange={(checked) => handleProfileUpdate("allowComments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Duets</p>
                    <p className="text-sm text-muted-foreground">Let people create duets with your videos</p>
                  </div>
                  <Switch
                    checked={profile.allowDuets}
                    onCheckedChange={(checked) => handleProfileUpdate("allowDuets", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Downloads</p>
                    <p className="text-sm text-muted-foreground">Let people download your videos</p>
                  </div>
                  <Switch
                    checked={profile.allowDownloads}
                    onCheckedChange={(checked) => handleProfileUpdate("allowDownloads", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* Activity Status */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Online Status</p>
                    <p className="text-sm text-muted-foreground">Let people see when you're active</p>
                  </div>
                  <Switch
                    checked={profile.showOnlineStatus}
                    onCheckedChange={(checked) => handleProfileUpdate("showOnlineStatus", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="ist">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                      <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
