import { create } from 'zustand'

interface AuthState {
    isAuthOpen: boolean
    onAuthSuccess : (()=>void) | null
    openAuth: (callback?: () => void) => void
    closeAuth: () => void
    // clearAuthCallback : ()=>void
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthOpen: false,
    onAuthSuccess : null,   
    openAuth: (callback) => set({ isAuthOpen: true , onAuthSuccess: callback || null }),
    closeAuth: () => set({ isAuthOpen: false, onAuthSuccess: null }),
}))