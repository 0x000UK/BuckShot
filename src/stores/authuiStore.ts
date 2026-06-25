import { create } from 'zustand'

interface UIState {
    isAuthOpen: boolean
    openAuth: () => void
    closeAuth: () => void
}

export const useAuthUIStore = create<UIState>((set) => ({
    isAuthOpen: false,
    openAuth: () => set({ isAuthOpen: true }),
    closeAuth: () => set({ isAuthOpen: false }),
}))