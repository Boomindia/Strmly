"use client"
import { useState } from "react"
import { X, Settings, Gauge, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface VideoMoreMenuProps {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
}

export default function VideoMoreMenu({ isOpen, onClose, videoId }: VideoMoreMenuProps) {
  const [quality, setQuality] = useState("720p")
  const [speed, setSpeed] = useState("1x")
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-background rounded-t-2xl w-full max-w-md p-4 lg:p-6 space-y-3 lg:space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base lg:text-lg font-semibold">Video Options</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 lg:p-3">
            <X size={18} className="lg:w-5 lg:h-5" />
          </Button>
        </div>

        {/* Quality Settings */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Settings size={14} className="lg:w-4 lg:h-4" />
            <span className="font-medium text-sm lg:text-base">Quality</span>
          </div>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger className="text-sm lg:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="360p">360p</SelectItem>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="720p">720p HD</SelectItem>
              <SelectItem value="1080p">1080p Full HD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Speed Settings */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Gauge size={14} className="lg:w-4 lg:h-4" />
            <span className="font-medium text-sm lg:text-base">Playback Speed</span>
          </div>
          <Select value={speed} onValueChange={setSpeed}>
            <SelectTrigger className="text-sm lg:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.25x">0.25x</SelectItem>
              <SelectItem value="0.5x">0.5x</SelectItem>
              <SelectItem value="0.75x">0.75x</SelectItem>
              <SelectItem value="1x">Normal</SelectItem>
              <SelectItem value="1.25x">1.25x</SelectItem>
              <SelectItem value="1.5x">1.5x</SelectItem>
              <SelectItem value="2x">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Download Option */}
        <Button variant="outline" className="w-full justify-start text-sm lg:text-base py-2 lg:py-3">
          <Download size={14} className="mr-2 lg:w-4 lg:h-4" />
          Download Video
        </Button>
      </div>
    </div>
  )
}