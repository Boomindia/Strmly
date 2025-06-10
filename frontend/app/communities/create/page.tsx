"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Camera, Users, Lock, Globe, Shield, Crown, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

const categories = [
  "Technology",
  "Business",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Sports",
  "Music",
  "Art",
  "Gaming",
  "Health",
  "Travel",
  "Food",
]

const communityTypes = [
  {
    value: "open",
    label: "Open Community",
    description: "Anyone can join and participate",
    icon: <Globe size={20} />,
  },
  {
    value: "approval",
    label: "Approval Required",
    description: "Members need approval to join",
    icon: <Shield size={20} />,
  },
  {
    value: "invite",
    label: "Invite Only",
    description: "Members can only join by invitation",
    icon: <Lock size={20} />,
  },
]

export default function CreateCommunityPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [communityData, setCommunityData] = useState({
    name: "",
    description: "",
    category: "",
    type: "open",
    avatar: null as File | null,
    banner: null as File | null,
    rules: [""] as string[],
    tags: [] as string[],
    allowVideoUploads: true,
    allowLiveStreams: true,
    moderationLevel: "medium",
    welcomeMessage: "",
  })

  const [tagInput, setTagInput] = useState("")

  const handleInputChange = (field: string, value: any) => {
    setCommunityData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: "avatar" | "banner", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCommunityData((prev) => ({ ...prev, [field]: file }))
    }
  }

  const addRule = () => {
    setCommunityData((prev) => ({
      ...prev,
      rules: [...prev.rules, ""],
    }))
  }

  const updateRule = (index: number, value: string) => {
    setCommunityData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? value : rule)),
    }))
  }

  const removeRule = (index: number) => {
    setCommunityData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !communityData.tags.includes(tagInput.trim())) {
      setCommunityData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCommunityData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleCreateCommunity = () => {
    console.log("Creating community:", communityData)
    // API call to create community
    alert("Community created successfully!")
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return communityData.name.trim() !== "" && communityData.description.trim() !== ""
      case 2:
        return communityData.category !== "" && communityData.type !== ""
      case 3:
        return communityData.rules.some((rule) => rule.trim() !== "")
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/communities">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Create Community</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{currentStep}/4</span>
            <div className="w-16 h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Upload */}
              <div>
                <Label>Community Banner</Label>
                <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/40 rounded-lg overflow-hidden">
                  {communityData.banner ? (
                    <Image
                      src={URL.createObjectURL(communityData.banner) || "/placeholder.svg"}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Upload size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => document.getElementById("banner-upload")?.click()}
                  >
                    <Camera size={16} className="mr-2" />
                    {communityData.banner ? "Change" : "Upload"} Banner
                  </Button>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("banner", e)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={communityData.avatar ? URL.createObjectURL(communityData.avatar) : "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      <Users size={32} className="text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    <Camera size={14} />
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("avatar", e)}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="name">Community Name *</Label>
                    <Input
                      id="name"
                      value={communityData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter community name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={communityData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe what your community is about..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Category and Privacy */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Category & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Category *</Label>
                <Select value={communityData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Community Type *</Label>
                <RadioGroup value={communityData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  {communityTypes.map((type) => (
                    <div key={type.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={type.value} className="flex items-center font-medium">
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags to help people find your community"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                {communityData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {communityData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Rules and Guidelines */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Community Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set clear guidelines to maintain a healthy community environment
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Community Rules</Label>
                <div className="space-y-3">
                  {communityData.rules.map((rule, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                      />
                      {communityData.rules.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeRule(index)}>
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={addRule}
                  className="mt-2"
                  disabled={communityData.rules.length >= 10}
                >
                  Add Rule
                </Button>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={communityData.welcomeMessage}
                  onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                  placeholder="Welcome new members with a friendly message..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Moderation Level</Label>
                <RadioGroup
                  value={communityData.moderationLevel}
                  onValueChange={(value) => handleInputChange("moderationLevel", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low - Minimal moderation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium - Balanced moderation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High - Strict moderation</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Features and Review */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Features & Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Community Features</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Allow Video Uploads</p>
                      <p className="text-sm text-muted-foreground">Members can upload videos to the community</p>
                    </div>
                    <Switch
                      checked={communityData.allowVideoUploads}
                      onCheckedChange={(checked) => handleInputChange("allowVideoUploads", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Allow Live Streams</p>
                      <p className="text-sm text-muted-foreground">Members can host live streams in the community</p>
                    </div>
                    <Switch
                      checked={communityData.allowLiveStreams}
                      onCheckedChange={(checked) => handleInputChange("allowLiveStreams", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Community Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={communityData.avatar ? URL.createObjectURL(communityData.avatar) : "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        <Users size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{communityData.name}</p>
                      <p className="text-muted-foreground">{communityData.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p>
                        <strong>Category:</strong> {communityData.category}
                      </p>
                      <p>
                        <strong>Type:</strong> {communityTypes.find((t) => t.value === communityData.type)?.label}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Rules:</strong> {communityData.rules.filter((r) => r.trim()).length}
                      </p>
                      <p>
                        <strong>Tags:</strong> {communityData.tags.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}

          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceedToNext()} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button onClick={handleCreateCommunity} className="ml-auto" size="lg">
              <Crown size={16} className="mr-2" />
              Create Community
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
