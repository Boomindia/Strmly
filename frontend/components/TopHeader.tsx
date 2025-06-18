"use client"

import { Wallet, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TopHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-40 lg:ml-64">
      <div className="flex items-center justify-between p-3 lg:p-4">
        <div className="flex-1" />
        <div className="flex items-center gap-2 lg:gap-3">
          <Link href="/wallet">
            <Button variant="ghost" size="sm" className="relative p-2 lg:p-3">
              <Wallet size={18} className="lg:w-5 lg:h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="relative p-2 lg:p-3">
            <Bell size={18} className="lg:w-5 lg:h-5" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full"></div>
          </Button>
        </div>
      </div>
    </div>
  )
}