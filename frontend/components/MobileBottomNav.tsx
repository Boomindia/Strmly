"use client"

import { Home, Video, Plus, Search, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Video, label: "Shorts", href: "/shorts" },
    { icon: Plus, label: "Upload", href: "/upload" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <div className="mobile-bottom-nav items-center justify-center fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex gap-6 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-0",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}




