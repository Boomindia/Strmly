"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, HelpCircle, Camera, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
]

const languages = [
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
]

const preferences = [
  { id: "education", label: "Education", icon: "📚" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌟" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "cooking", label: "Cooking", icon: "👨‍🍳" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "fitness", label: "Fitness", icon: "💪" },
]

export default function AuthPage() {
  const [step, setStep] = useState<"welcome" | "signup" | "login" | "otp" | "register">("welcome")
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [isNewUser, setIsNewUser] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsRegistration, setNeedsRegistration] = useState(false)

  // Registration form data
  const [registrationData, setRegistrationData] = useState({
    name: "",
    username: "",
    gender: "",
    profilePhoto: null as File | null,
    selectedPreferences: [] as string[],
    selectedLanguages: [] as string[],
    location: "",
  })

  const { sendOTP, verifyOTP, loading: authLoading, error: authError, setIsLoggedIn } = useAuthStore()
  const router = useRouter()

  const handleSendOTP = async () => {
    try {
      // Format phone number: remove any spaces, dashes, or parentheses
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
      const fullPhoneNumber = `${countryCode}${formattedPhone}`
      console.log('Attempting to send OTP to:', fullPhoneNumber)
      
      await sendOTP(fullPhoneNumber)
      setStep("otp")
    } catch (error) {
      console.error('Error in handleSendOTP:', error)
    }
  }

  const handleVerifyOTP = async () => {
    await verifyOTP(otp)
    if (isNewUser) {
      setStep("register")
      getCurrentLocation()
    } else {
      router.push("/")
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, use reverse geocoding to get city name
          setLocation("Mumbai, India")
          setRegistrationData((prev) => ({ ...prev, location: "Mumbai, India" }))
        },
        (error) => {
          console.log("Location access denied")
          setLocation("Location not available")
        },
      )
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true)
      await useAuthStore.getState().handleSocialLogin(provider)
      
      // If needsRegistration is true, the user needs to complete their profile
      if (needsRegistration) {
        setStep("register")
      }
    } catch (error) {
      console.error('Error in handleSocialLogin:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign in with ' + provider)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceToggle = (preferenceId: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      selectedPreferences: prev.selectedPreferences.includes(preferenceId)
        ? prev.selectedPreferences.filter((id) => id !== preferenceId)
        : [...prev.selectedPreferences, preferenceId],
    }))
  }

  const handleLanguageToggle = (languageCode: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(languageCode)
        ? prev.selectedLanguages.filter((code) => code !== languageCode)
        : [...prev.selectedLanguages, languageCode],
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setRegistrationData((prev) => ({ ...prev, profilePhoto: file }))
    }
  }

  const handleRegistrationComplete = () => {
    console.log("Registration data:", registrationData)
    // API call to register user
    setIsLoggedIn(true)
    router.push("/")
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          registrationData.name.trim() !== "" &&
          registrationData.username.trim() !== "" &&
          registrationData.gender !== ""
        )
      case 2:
        return registrationData.selectedPreferences.length > 0
      case 3:
        return registrationData.selectedLanguages.length > 0
      default:
        return true
    }
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center px-6">
        <div className="w-32 h-32 mb-16 bg-white rounded-3xl flex items-center justify-center">
          <span className="text-4xl font-bold text-red-500">STRMLY</span>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={() => setStep("signup")}
            className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
          >
            Get Started
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            by continuing you agree to our <span className="underline">terms & privacy</span> ↗
          </p>
        </div>
      </div>
    )
  }

  if (step === "signup" || step === "login") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col px-6 py-8">
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
          <div className="space-y-4">
            {error && (
              <div className="bg-white/10 text-white p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                variant="outline"
                className="w-full bg-white/10 text-white hover:bg-white/20 rounded-full py-4 text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
                variant="outline"
                className="w-full bg-white/10 text-white hover:bg-white/20 rounded-full py-4 text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-red-500 px-2 text-white/70">or continue with phone</span>
              </div>
            </div>

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
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={!phoneNumber || loading}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              by continuing you agree to our <span className="underline">terms & privacy</span> ↗
            </p>
          </div>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" className="hidden" />
      </div>
    )
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col px-6 py-8">
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
          <div className="space-y-4">
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-full py-4 text-lg"
            />

            <Button
              onClick={handleVerifyOTP}
              disabled={!otp || loading}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-center">
              <p className="text-white/90 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === "register") {
    return (
      <div className="min-h-screen bg-background">
        {/* Progress Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="text-xl font-bold">Complete Your Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{currentStep}/4</span>
              <div className="w-16 h-2 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          registrationData.profilePhoto
                            ? URL.createObjectURL(registrationData.profilePhoto)
                            : "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        <Camera size={32} className="text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                    >
                      <Camera size={14} />
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Add a profile photo (optional)</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={registrationData.name}
                      onChange={(e) => setRegistrationData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={registrationData.username}
                      onChange={(e) => setRegistrationData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={registrationData.gender}
                      onValueChange={(value) => setRegistrationData((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">{location || "Detecting location..."}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>What interests you?</CardTitle>
                <p className="text-sm text-muted-foreground">Select topics you'd like to see content about</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {preferences.map((preference) => (
                    <Button
                      key={preference.id}
                      variant={registrationData.selectedPreferences.includes(preference.id) ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handlePreferenceToggle(preference.id)}
                    >
                      <span className="text-2xl">{preference.icon}</span>
                      <span className="text-sm">{preference.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Selected: {registrationData.selectedPreferences.length} preferences
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Languages */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Video Languages</CardTitle>
                <p className="text-sm text-muted-foreground">Choose languages for videos you'd like to watch</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        registrationData.selectedLanguages.includes(language.code)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent"
                      }`}
                      onClick={() => handleLanguageToggle(language.code)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </div>
                      {registrationData.selectedLanguages.includes(language.code) && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Selected: {registrationData.selectedLanguages.length} languages
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Make sure everything looks good before continuing</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={
                        registrationData.profilePhoto
                          ? URL.createObjectURL(registrationData.profilePhoto)
                          : "/placeholder.svg"
                      }
                    />
                    <AvatarFallback>{registrationData.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{registrationData.name}</h3>
                    <p className="text-sm text-muted-foreground">@{registrationData.username}</p>
                    <p className="text-sm text-muted-foreground capitalize">{registrationData.gender}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {registrationData.selectedPreferences.map((prefId) => {
                      const pref = preferences.find((p) => p.id === prefId)
                      return (
                        <Badge key={prefId} variant="secondary">
                          {pref?.icon} {pref?.label}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {registrationData.selectedLanguages.map((langCode) => {
                      const lang = languages.find((l) => l.code === langCode)
                      return (
                        <Badge key={langCode} variant="secondary">
                          {lang?.flag} {lang?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{location}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep < 4 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    handleRegistrationComplete()
                  } else {
                    setCurrentStep(4) // Skip to review
                  }
                }}
              >
                Skip
              </Button>
            )}

            <Button
              onClick={() => {
                if (currentStep === 4) {
                  handleRegistrationComplete()
                } else {
                  setCurrentStep(currentStep + 1)
                }
              }}
              disabled={!canProceedToNext()}
              className="ml-auto"
            >
              {currentStep === 4 ? "Complete Profile" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
