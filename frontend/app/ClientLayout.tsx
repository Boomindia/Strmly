"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/Sidebar"
import MobileBottomNav from "@/components/MobileBottomNav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return

    if (session && pathname === "/auth") {
      router.push("/")
    } else if (!session && pathname !== "/auth") {
      router.push("/auth")
    }
  }, [session, status, pathname, router])

  return (
    <div className="min-h-screen bg-background">
      {session && (
        <>
          <Sidebar />
          <MobileBottomNav />
        </>
      )}
      <main className={session ? "md:ml-64 mobile-layout" : ""}>{children}</main>
    </div>
  )
}
