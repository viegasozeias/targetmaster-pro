import { create } from "zustand"
import { supabase } from "@/lib/supabase"

export interface Firearm {
    id: string
    make: string
    model: string
    caliber: string
    serial_number: string
    round_count: number
    last_maintenance_date: string | null
    image_url: string | null
}

export interface AmmoBatch {
    id: string
    caliber: string
    brand: string
    grain: number
    quantity: number
}

interface ArsenalState {
    firearms: Firearm[]
    ammo: AmmoBatch[]
    isLoading: boolean
    fetchArsenal: () => Promise<void>
    addFirearm: (firearm: Omit<Firearm, 'id' | 'created_at' | 'user_id'>) => Promise<void>
    updateRoundCount: (id: string, newCount: number) => Promise<void>
    addAmmo: (ammo: Omit<AmmoBatch, 'id' | 'created_at' | 'user_id'>) => Promise<void>
    updateAmmoQuantity: (id: string, newQuantity: number) => Promise<void>
}

export const useArsenalStore = create<ArsenalState>((set, get) => ({
    firearms: [],
    ammo: [],
    isLoading: false,
    fetchArsenal: async () => {
        set({ isLoading: true })
        try {
            const { data: firearms } = await supabase.from('firearms').select('*').order('created_at', { ascending: false })
            const { data: ammo } = await supabase.from('ammo_inventory').select('*').order('caliber')

            set({ firearms: firearms || [], ammo: ammo || [] })
        } catch (error) {
            console.error('Error fetching arsenal:', error)
        } finally {
            set({ isLoading: false })
        }
    },
    addFirearm: async (firearm) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('firearms').insert({ ...firearm, user_id: user.id })
        if (!error) get().fetchArsenal()
    },
    updateRoundCount: async (id, newCount) => {
        const { error } = await supabase.from('firearms').update({ round_count: newCount }).eq('id', id)
        if (!error) {
            set(state => ({
                firearms: state.firearms.map(f => f.id === id ? { ...f, round_count: newCount } : f)
            }))
        }
    },
    addAmmo: async (ammo) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('ammo_inventory').insert({ ...ammo, user_id: user.id })
        if (!error) get().fetchArsenal()
    },
    updateAmmoQuantity: async (id, newQuantity) => {
        const { error } = await supabase.from('ammo_inventory').update({ quantity: newQuantity }).eq('id', id)
        if (!error) {
            set(state => ({
                ammo: state.ammo.map(a => a.id === id ? { ...a, quantity: newQuantity } : a)
            }))
        }
    }
}))
