"use client"

import VideoFeed from "@/components/VideoFeed"
import TopHeader from "@/components/TopHeader"

export default function ShortsPage() {
  return (
    <div className="h-screen">
      <TopHeader />
      <div className="pt-16">
        <VideoFeed showMixedContent={false} />
      </div>
    </div>

    
  )
}
