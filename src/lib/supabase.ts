import { createClient } from '@supabase/supabase-js'

const getEnv = (key: string) => {
    // @ts-ignore
    return window.env?.[key] || import.meta.env[key]
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Authentication will not work.')
} else {
    console.log('Supabase Configured with URL:', supabaseUrl)
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
