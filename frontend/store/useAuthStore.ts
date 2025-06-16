import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  email: string
  image?: string
  avatar?: string
  provider?: string
  providerAccountId?: string
  username?: string
  bio?: string
  isVerified?: boolean
  location?: string
  website?: string
  createdAt?: string
  updatedAt?: string
  joinedDate?: string
}

type AuthStore = {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: async (token: string) => {
        set({ token, isLoggedIn: true })
      },
      logout: () => {
        set({ user: null, token: null, isLoggedIn: false })
      },
      setUser: (user: User) => {
        set({ user, isLoggedIn: true })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
