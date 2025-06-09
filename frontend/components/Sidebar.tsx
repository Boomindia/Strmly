"use client"

import type React from "react"

import { Home, Video, Film, Upload, User, MoreHorizontal, Settings, LogOut, Wallet, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)
  const router = useRouter()

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("user")
    router.push("/auth")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="desktop-sidebar fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4 flex flex-col justify-between z-50">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="text-3xl font-bold text-primary">
          BOOM
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        <SidebarItem icon={<Home size={22} />} label="Home" href="/" />
        <SidebarItem icon={<Video size={22} />} label="Short Videos" href="/shorts" />
        <SidebarItem icon={<Film size={22} />} label="Long Videos" href="/long" />
        <SidebarItem icon={<Upload size={22} />} label="Upload" href="/upload" />
        <SidebarItem icon={<User size={22} />} label="Profile" href="/profile" />
      </div>

      {/* More Button with Dropdown */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <MoreHorizontal className="mr-2" size={20} />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2" size={18} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
              <div className="flex items-center">
                {theme === "dark" ? <Sun className="mr-2" size={18} /> : <Moon className="mr-2" size={18} />}
                Dark Mode
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" size={18} />
              Logout
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
    <Link href={href} className="flex items-center px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors">
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </Link>
  )
}
