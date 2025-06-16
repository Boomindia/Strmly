"use client"

import { useState } from "react"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOptions, setShowOptions] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleGoogleLogin = () => {
    setLoading(true)
    setError("")
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`
  }

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
    console.log("Apple login clicked")
  }

  const handleEmailLogin = () => {
    // TODO: Implement email login
    console.log("Email login clicked")
  }

  return (
    <div className="min-h-screen bg-[#f62000] flex flex-col px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
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

          <div className="space-y-4 mt-52">
            {!showOptions ? (
              <>
                <div className="flex justify-center items-center absolute inset-0 mb-32">
                  <img 
                    src="/logo.svg" 
                    alt="STRMLY" 
                    className="h-18 w-auto"
                  />
                </div>
                <div className="fixed bottom-32 left-6 right-6">
                  <Button
                    onClick={() => setShowOptions(true)}
                    className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-8 text-2xl font-medium"
                  >
                    Get Started
                  </Button>
                  <div className="mt-4 text-center">
                    <p className="text-white/70 text-sm">
                      by continuing you agree to our <span className="underline">terms & privacy</span> ↗
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-8 text-2xl font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleAppleLogin}
                  className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-8 text-2xl font-medium flex items-center justify-center"
                >
                  <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.74.69 6.71-.65 1.29-1.52 2.58-2.72 3.73zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </Button>

                <Button
                  onClick={handleEmailLogin}
                  className="w-full bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full py-8 text-2xl font-medium"
                >
                  Continue with Email
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
