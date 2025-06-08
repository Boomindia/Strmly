"use client"

import { Wallet, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TopHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-40 md:ml-64">
      <div className="flex items-center justify-between p-4">
        
          <Link href="/wallet">
            <Button variant="ghost" size="sm" className="relative">
              <Wallet size={20} />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
      </div>
    </div>
  )
}