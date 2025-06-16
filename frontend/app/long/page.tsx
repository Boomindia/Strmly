"use client"

import VideoFeed from "@/components/VideoFeed"

export default function LongVideosPage() {
  return (
    <div className="h-screen">
      <VideoFeed longVideoOnly={true} />
    </div>
  )
}
