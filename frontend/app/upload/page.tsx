"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Video, X, ImageIcon, ArrowLeft, ArrowRight, Globe, Lock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

const videoGenres = [
  "Education",
  "Entertainment",
  "Technology",
  "Business",
  "Lifestyle",
  "Sports",
  "Music",
  "Cooking",
  "Travel",
  "Fitness",
  "Gaming",
  "News",
]

const ageRestrictions = [
  { value: "all", label: "All Ages", description: "Suitable for everyone" },
  { value: "13+", label: "13+", description: "May not be suitable for children under 13" },
  { value: "16+", label: "16+", description: "May not be suitable for children under 16" },
  { value: "18+", label: "18+", description: "Adults only" },
]

const mockCommunities = [
  { id: "1", name: "Tech Entrepreneurs", members: "12.5K", role: "owner" },
  { id: "2", name: "React Developers", members: "8.9K", role: "member" },
  { id: "3", name: "Startup Founders", members: "450", role: "admin" },
]

const mockSeries = [
  { id: "1", name: "Startup Journey", episodes: 5, totalEpisodes: 10 },
  { id: "2", name: "React Masterclass", episodes: 8, totalEpisodes: 12 },
]

export default function UploadPage() {
  const [uploadType, setUploadType] = useState<"short" | "long">("long")
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",

    // Community & Series
    communityId: "", // Updated default value to be a non-empty string
    videoType: "single", // single or series
    seriesType: "new", // new or existing
    seriesId: "",
    newSeriesName: "",
    newSeriesDescription: "",
    totalEpisodes: "",
    episodeNumber: "",

    // Monetization
    accessType: "free", // free or paid
    price: "",

    // Content Details
    genre: "",
    ageRestriction: "all",
    tags: [] as string[],

    // Technical
    orientation: "landscape", // portrait or landscape

    // Privacy
    visibility: "public", // public, unlisted, private
  })

  const [tagInput, setTagInput] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedThumbnail(file)
    }
  }

  const handleFormUpdate = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleFormUpdate("tags", [...formData.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleFormUpdate(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleUpload = () => {
    console.log("Uploading:", {
      file: selectedFile,
      thumbnail: selectedThumbnail,
      type: uploadType,
      ...formData,
    })
    alert("Upload started! (This is a demo)")
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedFile !== null
      case 2:
        return formData.title.trim() !== "" && formData.description.trim() !== ""
      case 3:
        if (formData.videoType === "series") {
          if (formData.seriesType === "new") {
            return formData.newSeriesName.trim() !== "" && formData.totalEpisodes !== ""
          } else {
            return formData.seriesId !== "" && formData.episodeNumber !== ""
          }
        }
        return true
      case 4:
        if (formData.accessType === "paid") {
          return formData.price !== "" && Number(formData.price) > 0
        }
        return true
      case 5:
        return formData.genre !== "" && formData.ageRestriction !== ""
      case 6:
        return formData.tags.length > 0
      default:
        return true
    }
  }

  const totalSteps = uploadType === "long" ? 7 : 4

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-xl font-bold">Upload Video</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {currentStep}/{totalSteps}
            </span>
            <div className="w-16 h-2 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Video Type Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as "short" | "long")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="short">Short Video</TabsTrigger>
                  <TabsTrigger value="long">Long Video</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                {selectedFile ? (
                  <div className="space-y-4">
                    <Video size={64} className="mx-auto text-primary" />
                    <div>
                      <p className="font-medium text-lg">{selectedFile.name}</p>
                      <p className="text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                      <X size={16} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={64} className="mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-xl font-medium">Upload your {uploadType} video</p>
                      <p className="text-muted-foreground">Drag and drop or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {uploadType === "short" ? "Max duration: 60 seconds" : "Supports MP4, MOV, AVI up to 2GB"}
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <Label htmlFor="video-upload">
                      <Button asChild size="lg">
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormUpdate("title", e.target.value)}
                  placeholder="Enter an engaging title for your video"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormUpdate("description", e.target.value)}
                  placeholder="Tell viewers about your video..."
                  rows={4}
                />
              </div>

              {/* Thumbnail Upload */}
              {uploadType === "long" && (
                <div>
                  <Label>Custom Thumbnail</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {selectedThumbnail ? (
                      <div className="space-y-4">
                        <div className="relative w-48 h-32 mx-auto">
                          <Image
                            src={URL.createObjectURL(selectedThumbnail) || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <p className="font-medium">{selectedThumbnail.name}</p>
                        <Button variant="outline" onClick={() => setSelectedThumbnail(null)}>
                          <X size={16} className="mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon size={48} className="mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Upload custom thumbnail</p>
                          <p className="text-sm text-muted-foreground">Recommended: 1280x720 (16:9 ratio)</p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailSelect}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <Label htmlFor="thumbnail-upload">
                          <Button asChild variant="outline">
                            <span>Choose Thumbnail</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Community & Series (Long videos only) */}
        {currentStep === 3 && uploadType === "long" && (
          <Card>
            <CardHeader>
              <CardTitle>Community & Series</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Community (Optional)</Label>
                <Select value={formData.communityId} onValueChange={(value) => handleFormUpdate("communityId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No community</SelectItem>{" "}
                    {/* Updated value prop to be a non-empty string */}
                    {mockCommunities.map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{community.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {community.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Video Type</Label>
                <RadioGroup value={formData.videoType} onValueChange={(value) => handleFormUpdate("videoType", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="series" id="series" />
                    <Label htmlFor="series">Part of a Series</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.videoType === "series" && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label>Series Type</Label>
                    <RadioGroup
                      value={formData.seriesType}
                      onValueChange={(value) => handleFormUpdate("seriesType", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing">Add to Existing Series</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new">Create New Series</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.seriesType === "existing" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Select Series</Label>
                        <Select
                          value={formData.seriesId}
                          onValueChange={(value) => handleFormUpdate("seriesId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an existing series" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSeries.map((series) => (
                              <SelectItem key={series.id} value={series.id}>
                                <div>
                                  <p className="font-medium">{series.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {series.episodes}/{series.totalEpisodes} episodes
                                  </p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="episodeNumber">Episode Number</Label>
                        <Input
                          id="episodeNumber"
                          type="number"
                          value={formData.episodeNumber}
                          onChange={(e) => handleFormUpdate("episodeNumber", e.target.value)}
                          placeholder="Episode number"
                        />
                      </div>
                    </div>
                  )}

                  {formData.seriesType === "new" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newSeriesName">Series Name *</Label>
                        <Input
                          id="newSeriesName"
                          value={formData.newSeriesName}
                          onChange={(e) => handleFormUpdate("newSeriesName", e.target.value)}
                          placeholder="Enter series name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newSeriesDescription">Series Description</Label>
                        <Textarea
                          id="newSeriesDescription"
                          value={formData.newSeriesDescription}
                          onChange={(e) => handleFormUpdate("newSeriesDescription", e.target.value)}
                          placeholder="Describe your series..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalEpisodes">Total Episodes *</Label>
                        <Input
                          id="totalEpisodes"
                          type="number"
                          value={formData.totalEpisodes}
                          onChange={(e) => handleFormUpdate("totalEpisodes", e.target.value)}
                          placeholder="How many episodes will this series have?"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Monetization (Long videos only) */}
        {currentStep === 4 && uploadType === "long" && (
          <Card>
            <CardHeader>
              <CardTitle>Monetization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Access Type</Label>
                <RadioGroup
                  value={formData.accessType}
                  onValueChange={(value) => handleFormUpdate("accessType", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free">Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid">Paid</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.accessType === "paid" && (
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFormUpdate("price", e.target.value)}
                    placeholder="Set your price"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Platform fee: 30% • You'll receive: ₹
                    {formData.price ? (Number(formData.price) * 0.7).toFixed(2) : "0"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Classification */}
        {currentStep === (uploadType === "long" ? 5 : 3) && (
          <Card>
            <CardHeader>
              <CardTitle>Content Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Genre *</Label>
                <Select value={formData.genre} onValueChange={(value) => handleFormUpdate("genre", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select video genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoGenres.map((genre) => (
                      <SelectItem key={genre} value={genre.toLowerCase()}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age Restriction *</Label>
                <RadioGroup
                  value={formData.ageRestriction}
                  onValueChange={(value) => handleFormUpdate("ageRestriction", value)}
                >
                  {ageRestrictions.map((restriction) => (
                    <div key={restriction.value} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={restriction.value} id={restriction.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={restriction.value} className="font-medium">
                          {restriction.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{restriction.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {currentStep === (uploadType === "long" ? 6 : 4) && (
          <Card>
            <CardHeader>
              <CardTitle>Tags & Discovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tags">Tags *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags to help people discover your video"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Press Enter or click Add to add tags</p>
              </div>

              {formData.tags.length > 0 && (
                <div>
                  <Label>Added Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {uploadType === "long" && (
                <div>
                  <Label>Video Orientation</Label>
                  <RadioGroup
                    value={formData.orientation}
                    onValueChange={(value) => handleFormUpdate("orientation", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landscape" id="landscape" />
                      <Label htmlFor="landscape">Landscape (16:9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="portrait" id="portrait" />
                      <Label htmlFor="portrait">Portrait (9:16)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Privacy & Publishing */}
        {currentStep === totalSteps && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Visibility</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={(value) => handleFormUpdate("visibility", value)}
                >
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="public" id="public" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="public" className="flex items-center font-medium">
                        <Globe size={16} className="mr-2" />
                        Public
                      </Label>
                      <p className="text-sm text-muted-foreground">Anyone can search for and view</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="unlisted" id="unlisted" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="unlisted" className="flex items-center font-medium">
                        <Users size={16} className="mr-2" />
                        Unlisted
                      </Label>
                      <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="private" id="private" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="private" className="flex items-center font-medium">
                        <Lock size={16} className="mr-2" />
                        Private
                      </Label>
                      <p className="text-sm text-muted-foreground">Only you can view</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Upload Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Title:</strong> {formData.title}
                  </p>
                  <p>
                    <strong>Type:</strong> {uploadType === "long" ? "Long Video" : "Short Video"}
                  </p>
                  {formData.videoType === "series" && (
                    <p>
                      <strong>Series:</strong>{" "}
                      {formData.seriesType === "new" ? formData.newSeriesName : "Existing Series"}
                    </p>
                  )}
                  <p>
                    <strong>Access:</strong> {formData.accessType === "paid" ? `Paid (₹${formData.price})` : "Free"}
                  </p>
                  <p>
                    <strong>Genre:</strong> {formData.genre}
                  </p>
                  <p>
                    <strong>Age Rating:</strong> {formData.ageRestriction}
                  </p>
                  <p>
                    <strong>Tags:</strong> {formData.tags.join(", ")}
                  </p>
                  <p>
                    <strong>Visibility:</strong> {formData.visibility}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep < totalSteps && (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceedToNext()} className="ml-auto">
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}

          {currentStep === totalSteps && (
            <Button onClick={handleUpload} className="ml-auto" size="lg">
              Publish Video
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
