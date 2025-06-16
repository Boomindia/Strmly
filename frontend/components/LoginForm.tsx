"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export default function LoginForm() {
  const [phone, setPhone] = useState("")
  const { login } = useAuthStore()

  const handleLogin = async () => {
    try {
      // Call your login API here
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      await login(data.token)
    } catch (error) {
      console.error("Login error:", error)
      // Handle error appropriately
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  )
}
