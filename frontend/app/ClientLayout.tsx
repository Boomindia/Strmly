"use client"

import type React from "react"

import Sidebar from "@/components/Sidebar"
import MobileBottomNav from "@/components/MobileBottomNav"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check localStorage for existing auth
    const token = localStorage.getItem("user")
    if (token && !isLoggedIn) {
      useAuthStore.getState().setIsLoggedIn(true)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn && pathname === "/auth") {
      router.push("/")
    } else if (!isLoggedIn && pathname !== "/auth") {
      router.push("/auth")
    }
  }, [isLoggedIn, pathname, router])

  return (
    <div className="min-h-screen bg-background">
      {isLoggedIn && (
        <>
          <Sidebar />
          <MobileBottomNav />
        </>
      )}
      <main className={isLoggedIn ? "md:ml-64 mobile-layout" : ""}>{children}</main>
    </div>
  )
}
