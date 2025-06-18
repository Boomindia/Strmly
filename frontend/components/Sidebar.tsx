"use client"

import type React from "react"

import { Home, Video, Film, Upload, User, MoreHorizontal, Settings, LogOut, Wallet, Moon, Sun, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    logout()
    router.push("/auth")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="desktop-sidebar fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4 flex flex-col justify-between z-50 hidden lg:flex">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="text-2xl lg:text-3xl font-bold text-primary">
          STRMLY
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        <SidebarItem icon={<Home size={20} className="lg:w-6 lg:h-6" />} label="Home" href="/" />
        {/* <SidebarItem icon={<Video size={20} className="lg:w-6 lg:h-6" />} label="Short Videos" href="/shorts" /> */}
        <SidebarItem icon={<Film size={20} className="lg:w-6 lg:h-6" />} label="Long Videos" href="/long" />
        <SidebarItem icon={<Search size={20} className="lg:w-6 lg:h-6" />} label="Search" href="/search" />
        <SidebarItem icon={<Upload size={20} className="lg:w-6 lg:h-6" />} label="Upload" href="/upload" />
        <SidebarItem icon={<User size={20} className="lg:w-6 lg:h-6" />} label="Profile" href="/profile" />
      </div>

      {/* More Button with Dropdown */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-sm lg:text-base">
              <MoreHorizontal className="mr-2 w-5 h-5 lg:w-6 lg:h-6" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
              <div className="flex items-center">
                {theme === "dark" ? <Sun className="mr-2 w-4 h-4" /> : <Moon className="mr-2 w-4 h-4" />}
                Dark Mode
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  return (
    <Link href={href} className="flex items-center px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base rounded-lg hover:bg-accent transition-colors">
      {icon}
      <span className="ml-2 lg:ml-3 font-medium">{label}</span>
    </Link>
  )
}
