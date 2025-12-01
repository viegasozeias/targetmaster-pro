import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface DiagnosisData {
    handedness: 'right' | 'left'
    eyeDominance: 'right' | 'left'
    visionIssues: string
    medications: string
    physicalLimitations: string
    firearmModel: string
    caliber: string
    shootingExperience: string
    shootingFrequency: string
}

interface DiagnosisStore {
    data: DiagnosisData | null
    isLoading: boolean
    setData: (data: DiagnosisData) => void
    fetchProfile: () => Promise<void>
    saveProfile: (data: DiagnosisData) => Promise<void>
}

export const useDiagnosisStore = create<DiagnosisStore>((set) => ({
    data: null,
    isLoading: false,
    setData: (data) => set({ data }),

    fetchProfile: async () => {
        set({ isLoading: true })
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            )

            const fetchLogic = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return null

                const { data, error } = await supabase
                    .from('profiles')
                    .select('handedness, eye_dominance, vision_issues, medications, physical_limitations, firearm_model, caliber, shooting_experience, shooting_frequency')
                    .eq('id', user.id)
                    .single()

                if (error) throw error
                return data
            }

            const data = await Promise.race([fetchLogic(), timeoutPromise]) as any

            if (data && data.handedness) {
                // Map snake_case DB fields to camelCase store fields
                set({
                    data: {
                        handedness: data.handedness,
                        eyeDominance: data.eye_dominance,
                        visionIssues: data.vision_issues || "",
                        medications: data.medications || "",
                        physicalLimitations: data.physical_limitations || "",
                        firearmModel: data.firearm_model || "",
                        caliber: data.caliber || "",
                        shootingExperience: data.shooting_experience || "",
                        shootingFrequency: data.shooting_frequency || ""
                    } as DiagnosisData
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    saveProfile: async (data) => {
        set({ isLoading: true })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({
                    handedness: data.handedness,
                    eye_dominance: data.eyeDominance,
                    vision_issues: data.visionIssues,
                    medications: data.medications,
                    physical_limitations: data.physicalLimitations,
                    firearm_model: data.firearmModel,
                    caliber: data.caliber,
                    shooting_experience: data.shootingExperience,
                    shooting_frequency: data.shootingFrequency
                })
                .eq('id', user.id)

            if (error) throw error
            set({ data })
        } catch (error) {
            console.error('Error saving profile:', error)
        } finally {
            set({ isLoading: false })
        }
    }
}))
