"use client"

import { useState } from "react"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
]

export default function AuthPage() {
  const [step, setStep] = useState<"welcome" | "signup" | "login" | "otp">("welcome")
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)
  const router = useRouter()

  const handleSendOTP = () => {
    console.log("Sending OTP to:", countryCode + phoneNumber)
    setStep("otp")
  }

  const handleVerifyOTP = () => {
    console.log("Verifying OTP:", otp)
    setIsLoggedIn(true)
    localStorage.setItem("user", "dummy_token")
    router.push("/")
  }

  const handleSocialLogin = (provider: string) => {
    console.log("Login with:", provider)
    // In a real app, integrate with social login providers
    setIsLoggedIn(true)
    localStorage.setItem("user", "dummy_token")
    router.push("/")
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-6">
        {/* Logo placeholder - will be added later */}
        <div className="w-32 h-32 mb-16">{/* Logo will go here */}</div>

        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={() => setStep("signup")}
            className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
          >
            create account
          </Button>

          <Button
            onClick={() => setStep("login")}
            variant="ghost"
            className="w-full text-white hover:bg-white/10 text-lg font-medium"
          >
            log in
          </Button>
        </div>
      </div>
    )
  }

  if (step === "signup" || step === "login") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("welcome")}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft size={24} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
            <HelpCircle size={24} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {/* Social Login Options */}
          <div className="space-y-4 mb-8">
            <Button
              onClick={() => handleSocialLogin("Apple")}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium flex items-center justify-center"
            >
              <span className="mr-3">🍎</span>
              continue with Apple
            </Button>

            <Button
              onClick={() => handleSocialLogin("Google")}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium flex items-center justify-center"
            >
              <span className="mr-3">🔍</span>
              continue with Google
            </Button>

            <Button
              onClick={() => handleSocialLogin("TikTok")}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium flex items-center justify-center"
            >
              <span className="mr-3">🎵</span>
              continue with TikTok
            </Button>

            <Button
              onClick={() => setStep(step === "signup" ? "signup" : "login")}
              className="w-full bg-red-400 text-white hover:bg-red-600 rounded-full py-4 text-lg font-medium"
            >
              continue with phone
            </Button>
          </div>

          {/* Phone Number Form */}
          <div className="space-y-4">
            {step === "signup" && (
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-full py-4 text-lg"
              />
            )}

            <div className="flex space-x-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-full py-4 text-lg"
              />
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={!phoneNumber}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
            >
              Send OTP
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              by continuing you agree to our <span className="underline">terms & privacy</span> ↗
            </p>
          </div>
        </div>
      </div>
    )     

     
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("signup")}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft size={24} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
            <HelpCircle size={24} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">Enter OTP</h2>
            <p className="text-white/70">
              We sent a code to {countryCode} {phoneNumber}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-full py-4 text-lg text-center"
            />

            <Button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
            >
              Verify OTP
            </Button>

            <Button variant="ghost" className="w-full text-white hover:bg-white/10 text-sm">
              Resend OTP
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
