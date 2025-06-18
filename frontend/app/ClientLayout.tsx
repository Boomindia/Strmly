"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import Sidebar from "@/components/Sidebar"
import MobileBottomNav from "@/components/MobileBottomNav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set loading to false after the first render
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return // Don't redirect while loading

    if (isLoggedIn && pathname === "/auth") {
      router.push("/")
    } else if (!isLoggedIn && pathname !== "/auth" && pathname !== "/auth/callback") {
      router.push("/auth")
    }
  }, [isLoggedIn, pathname, router, isLoading])

  if (isLoading) {
    return null // Or a loading spinner if you prefer
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {isLoggedIn && (
        <>
          <Sidebar />
          <MobileBottomNav />
        </>
      )}
      <main className={isLoggedIn ? "md:ml-64 mobile-layout w-full" : "w-full"}>
        {children}
      </main>
    </div>
  )
}
