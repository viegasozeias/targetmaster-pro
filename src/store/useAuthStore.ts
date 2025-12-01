
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
    id: string
    email: string
    full_name: string
    subscription_tier: 'free' | 'pro'
    stripe_customer_id: string | null
    subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete' | null
    role: 'user' | 'admin'
}

interface AuthState {
    user: User | null
    profile: Profile | null
    isLoading: boolean
    isAdmin: boolean
    initialized: boolean
    initialize: () => Promise<void>
    refreshProfile: () => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
    initialized: false,
    initialize: async () => {
        if (get().initialized) return
        console.log('Auth: initializing...')
        try {
            // Create a timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth init timeout')), 10000)
            )

            // Race between getSession and timeout
            const { data: { session } } = await Promise.race([
                supabase.auth.getSession(),
                timeout
            ]) as any

            console.log('Auth: session found?', !!session)
            set({ user: session?.user ?? null })

            if (session?.user) {
                console.log('Auth: refreshing profile...')
                await get().refreshProfile()
            } else {
                console.log('Auth: no user, loading false')
                set({ isLoading: false })
            }
            set({ initialized: true })

            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth: state change', event)
                set({ user: session?.user ?? null })
                if (session?.user) {
                    await get().refreshProfile()
                } else {
                    set({ profile: null, isAdmin: false, isLoading: false })
                }
            })
        } catch (error) {
            console.error('Error initializing auth:', error)
            // Force loading false on error/timeout to unblock UI
            set({ isLoading: false })
        }
    },
    refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
            console.log('Auth: fetching profile for', user.id)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Auth: profile fetch error', error)
                throw error
            }

            console.log('Auth: profile fetched', data)
            set({
                profile: data as Profile,
                isAdmin: data?.role === 'admin',
                isLoading: false
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
            set({ isLoading: false })
        }
    },
    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, isAdmin: false })
    }
}))

