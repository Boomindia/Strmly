"use client"

import { Home, Video, Plus, Search, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Video, label: "Long", href: "/long" },
    { icon: Plus, label: "Upload", href: "/upload" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <div className="mobile-bottom-nav items-center justify-center fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around w-full px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-20",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}




