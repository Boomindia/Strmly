import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'

type User = {
  id: string
  name: string
  username: string
  phoneNumber: string
  email?: string
  avatar?: string
  bio?: string
  isVerified: boolean
}

type AuthStore = {
  isLoggedIn: boolean
  user: User | null
  loading: boolean
  error: string | null
  setIsLoggedIn: (loggedIn: boolean) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  sendOTP: (phoneNumber: string) => Promise<void>
  verifyOTP: (otp: string) => Promise<void>
  handleSocialLogin: (provider: 'google' | 'facebook') => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,
  loading: false,
  error: null,
  setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  sendOTP: async (phoneNumber) => {
    try {
      set({ loading: true, error: null })
      console.log('Sending OTP to:', phoneNumber)
      
      // Create reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified')
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired')
          set({ error: 'reCAPTCHA expired. Please try again.' })
        }
      })
      
      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      console.log('OTP sent successfully')
      
      // Store confirmation result in window object for later use
      ;(window as any).confirmationResult = confirmationResult
      
      set({ loading: false })
    } catch (error) {
      console.error('Error sending OTP:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.' 
      })
    }
  },
  
  verifyOTP: async (otp) => {
    try {
      set({ loading: true, error: null })
      
      // Get the confirmation result from the window object
      const confirmationResult = (window as any).confirmationResult
      if (!confirmationResult) {
        throw new Error('No confirmation result found')
      }
      
      // Verify OTP
      const result = await confirmationResult.confirm(otp)
      const idToken = await result.user.getIdToken()
      
      // Call backend to verify OTP and get user data
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to verify OTP')
      }
      
      const data = await response.json()
      
      // Update store with user data
      set({
        isLoggedIn: true,
        user: data.user,
        loading: false,
      })
      
      // Store token
      localStorage.setItem('token', data.accessToken)
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to verify OTP' })
    }
  },
  
  handleSocialLogin: async (provider) => {
    try {
      set({ loading: true, error: null })
      
      let authProvider
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider()
        // Add scopes for Google
        authProvider.addScope('profile')
        authProvider.addScope('email')
      } else {
        authProvider = new FacebookAuthProvider()
        // Add scopes for Facebook
        authProvider.addScope('email')
        authProvider.addScope('public_profile')
      }
      
      // Sign in with popup
      const result = await signInWithPopup(auth, authProvider)
      const idToken = await result.user.getIdToken()
      
      // Check if user exists
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          provider,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to check user')
      }
      
      const data = await response.json()
      
      if (data.exists) {
        // User exists, log them in
        set({
          isLoggedIn: true,
          user: data.user,
          loading: false,
        })
        localStorage.setItem('token', data.accessToken)
      } else {
        // User doesn't exist, redirect to registration
        set({
          isLoggedIn: false,
          user: null,
          loading: false,
        })
        // You can add a state to indicate that registration is needed
        // and redirect to the registration page
      }
    } catch (error) {
      console.error('Social login error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in with ' + provider 
      })
      // If the popup was blocked, show a more specific error
      if (error.code === 'auth/popup-blocked') {
        set({ error: 'Please allow popups for this website to sign in with ' + provider })
      } else if (error.code === 'auth/popup-closed-by-user') {
        set({ error: 'Sign in was cancelled. Please try again.' })
      }
    }
  },
  
  logout: () => {
    auth.signOut()
    localStorage.removeItem('token')
    set({
      isLoggedIn: false,
      user: null,
      error: null,
    })
  },
}))
