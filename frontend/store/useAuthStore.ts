import { create } from 'zustand'
import { signIn, signOut, useSession } from 'next-auth/react'

type User = {
  id: string
  name: string
  username: string
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
  handleSocialLogin: (provider: 'google' | 'apple') => Promise<void>
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
  
  handleSocialLogin: async (provider) => {
    try {
      set({ loading: true, error: null })
      
      const result = await signIn(provider, {
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // The session will be updated automatically by NextAuth
      set({ loading: false })
    } catch (error) {
      console.error('Social login error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to sign in with ' + provider 
      })
    }
  },
  
  logout: async () => {
    try {
      await signOut()
      set({
        isLoggedIn: false,
        user: null,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
      set({ error: 'Failed to logout' })
    }
  },
}))
