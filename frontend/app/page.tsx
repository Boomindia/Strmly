"use client"

import { useAuthStore } from "@/store/useAuthStore"
import VideoFeed from "@/components/VideoFeed"

export default function Home() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="h-screen">
        
        <VideoFeed longVideoOnly={true} />
      </div>

    
  )
}
