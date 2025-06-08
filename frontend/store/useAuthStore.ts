import { create } from 'zustand'

type AuthStore = {
  isLoggedIn: boolean
  setIsLoggedIn: (loggedIn: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: true,
  setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
}))
