"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Access was denied. Please try signing in again."
      case "Configuration":
        return "There is a problem with the server configuration. Please check your environment variables."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "OAuthSignin":
        return "Error in the OAuth sign-in process. Please try again."
      case "OAuthCallback":
        return "Error in the OAuth callback process. Please try again."
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database."
      case "EmailCreateAccount":
        return "Could not create email provider user in the database."
      case "Callback":
        return "Error in the OAuth callback process. Please try again."
      case "OAuthAccountNotLinked":
        return "Email on the account already exists with different credentials."
      case "EmailSignin":
        return "Check your email address."
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct."
      case "SessionRequired":
        return "Please sign in to access this page."
      default:
        return "An error occurred during authentication. Please try again."
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please contact support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            asChild
          >
            <Link href="/auth">
              Try Again
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 