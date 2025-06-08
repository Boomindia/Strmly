"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Video, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<"short" | "long">("short")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [category, setCategory] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [price, setPrice] = useState("")

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

  const handleUpload = () => {
    if (!selectedFile) return

    console.log("Uploading:", {
      file: selectedFile,
      thumbnail: selectedThumbnail,
      type: uploadType,
      title,
      description,
      hashtags,
      category,
      visibility,
      price,
    })

    alert("Upload started! (This is a demo)")
  }

  return (
    <div className="p-4 pb-20 md:pb-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Content</h1>

      <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as "short" | "long")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="short" className="text-lg py-3">
            Short Video
          </TabsTrigger>
          <TabsTrigger value="long" className="text-lg py-3">
            Long Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="short" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Short Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <p className="text-xl font-medium">Upload your short video</p>
                      <p className="text-muted-foreground">Drag and drop or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-2">Max duration: 60 seconds</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers about your video..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="hashtags">Hashtags</Label>
                  <Input
                    id="hashtags"
                    placeholder="#startup #tech #innovation"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleUpload} disabled={!selectedFile} className="w-full" size="lg">
                Upload Short Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="long" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Long Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <p className="text-xl font-medium">Upload your long video</p>
                      <p className="text-muted-foreground">Drag and drop or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-2">Supports MP4, MOV, AVI up to 2GB</p>
                    </div>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="long-video-upload"
                    />
                    <Label htmlFor="long-video-upload">
                      <Button asChild size="lg">
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Video Thumbnail</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter video title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input id="price" placeholder="$9.99" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="long-description">Description</Label>
                <Textarea
                  id="long-description"
                  placeholder="Tell viewers about your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="long-hashtags">Tags</Label>
                <Input
                  id="long-hashtags"
                  placeholder="startup, tech, innovation"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>

              <Button onClick={handleUpload} disabled={!selectedFile || !title} className="w-full" size="lg">
                Upload Long Video
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
