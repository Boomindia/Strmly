"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export default function SignupForm() {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const { login } = useAuthStore()

  const handleSignup = async () => {
    try {
      // Call your signup API here
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const data = await response.json()
      await login(data.token)
    } catch (error) {
      console.error("Signup error:", error)
      // Handle error appropriately
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSignup()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

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

      <Button type="submit" className="w-full" onClick={handleSignup}>
        Sign Up
      </Button>
    </form>
  )
}
