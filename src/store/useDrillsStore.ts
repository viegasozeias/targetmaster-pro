import { create } from "zustand"
import { supabase } from "@/lib/supabase"

export interface Drill {
    id: string
    title: string
    description: string
    steps: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    category: 'accuracy' | 'speed' | 'manipulation' | 'mixed'
    created_at: string
}

export interface DrillLog {
    id: string
    user_id: string
    drill_id: string
    score: number
    time_taken: number
    notes: string
    created_at: string
}

interface DrillsState {
    drills: Drill[]
    isLoading: boolean
    fetchDrills: () => Promise<void>
    logAttempt: (drillId: string, score: number, timeTaken: number, notes: string) => Promise<void>
}

export const useDrillsStore = create<DrillsState>((set) => ({
    drills: [],
    isLoading: false,
    fetchDrills: async () => {
        set({ isLoading: true })
        try {
            // Timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Drills fetch timeout')), 10000)
            )

            const fetchPromise = supabase
                .from('drills')
                .select('*')
                .order('title')

            const { data, error } = await Promise.race([fetchPromise, timeout]) as any

            if (error) throw error
            set({ drills: data || [] })
        } catch (error) {
            console.error('Error fetching drills:', error)
        } finally {
            set({ isLoading: false })
        }
    },
    logAttempt: async (drillId, score, timeTaken, notes) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('drill_logs')
                .insert({
                    user_id: user.id,
                    drill_id: drillId,
                    score,
                    time_taken: timeTaken,
                    notes
                })

            if (error) throw error
        } catch (error) {
            console.error('Error logging drill attempt:', error)
            throw error
        }
    }
}))
