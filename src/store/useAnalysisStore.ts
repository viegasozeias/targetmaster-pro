import { create } from "zustand"
import { supabase } from "@/lib/supabase"

export interface Shot {
    id: string
    x: number
    y: number
}

export interface AnalysisRecord {
    id: string
    created_at: string
    image_url: string | null
    diagnosis: any
    grouping_size: number
}

interface AnalysisState {
    image: string | null
    shots: Shot[]
    isAnalysisComplete: boolean
    currentAnalysisId: string | null
    history: AnalysisRecord[]
    isLoadingHistory: boolean
    setImage: (image: string | null) => void
    addShot: (shot: Shot) => void
    removeShot: (id: string) => void
    clearShots: () => void
    setAnalysisComplete: (complete: boolean) => void
    reset: () => void
    saveAnalysis: (diagnosis: any, groupingSize: number) => Promise<void>
    fetchHistory: () => Promise<void>
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
    image: null,
    shots: [],
    isAnalysisComplete: false,
    currentAnalysisId: null,
    history: [],
    isLoadingHistory: false,
    setImage: (image) => set({ image, isAnalysisComplete: false, shots: [], currentAnalysisId: null }),
    addShot: (shot) => set((state) => ({ shots: [...state.shots, shot] })),
    removeShot: (id) =>
        set((state) => ({ shots: state.shots.filter((s) => s.id !== id) })),
    clearShots: () => set({ shots: [] }),
    setAnalysisComplete: (isAnalysisComplete) => set({
        isAnalysisComplete,
        currentAnalysisId: isAnalysisComplete ? crypto.randomUUID() : null
    }),
    reset: () => set({ image: null, shots: [], isAnalysisComplete: false, currentAnalysisId: null }),

    saveAnalysis: async (diagnosis, groupingSize) => {
        const { image, currentAnalysisId } = get()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !image || !currentAnalysisId) return

        try {
            // 1. Upload image to Storage (Optional - skipping for now to keep it simple, storing base64 is bad practice but quick for MVP,
            // actually let's just not store the image for now or store a placeholder if we don't have storage bucket set up)
            // For this MVP, we will skip image upload to avoid Storage bucket setup complexity for the user.

            const { error } = await supabase.from('analyses').upsert({
                id: currentAnalysisId,
                user_id: user.id,
                diagnosis,
                grouping_size: groupingSize,
                // image_url: publicUrl
            })

            if (error) throw error
        } catch (error) {
            console.error('Error saving analysis:', error)
        }
    },

    fetchHistory: async () => {
        set({ isLoadingHistory: true })
        try {
            // Timeout promise
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('History fetch timeout')), 10000)
            )

            const fetchPromise = supabase
                .from('analyses')
                .select('*')
                .order('created_at', { ascending: false })

            const { data, error } = await Promise.race([fetchPromise, timeout]) as any

            if (error) throw error
            set({ history: data || [] })
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            set({ isLoadingHistory: false })
        }
    }
}))
