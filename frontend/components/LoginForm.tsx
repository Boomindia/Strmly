"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export default function LoginForm() {
  const [phone, setPhone] = useState("")
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)

  const handleLogin = async () => {
    // Assume login is successful
    setIsLoggedIn(true)
    localStorage.setItem("user", "dummy_token")
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
