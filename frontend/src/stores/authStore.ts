import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'
import { wsService } from '../services/websocket'

interface AuthState {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      token: null,
      username: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const data = await authApi.login({ username, password })
        localStorage.setItem('token', data.token)
        set({ token: data.token, username: data.username, isAuthenticated: true })
        await wsService.connect(data.token)
      },

      logout: () => {
        wsService.disconnect()
        localStorage.removeItem('token')
        localStorage.removeItem('auth-storage')
        set({ token: null, username: null, isAuthenticated: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ token: state.token, username: state.username, isAuthenticated: state.isAuthenticated })
    }
  )
)
