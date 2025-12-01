import { useAuthStore } from "@/store/useAuthStore"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export function DebugPublic() {
    const authStore = useAuthStore()
    const [supabaseStatus, setSupabaseStatus] = useState("Checking...")
    const [sessionInfo, setSessionInfo] = useState<any>(null)

    const [fetchStatus, setFetchStatus] = useState("Checking...")

    useEffect(() => {
        checkSupabase()
        checkFetch()
    }, [])

    async function checkFetch() {
        try {
            const url = import.meta.env.VITE_SUPABASE_URL
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY

            const response = await fetch(`${url}/rest/v1/profiles?select=count&limit=1`, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            })

            if (response.ok) {
                const json = await response.json()
                setFetchStatus(`Success: ${JSON.stringify(json)}`)
            } else {
                setFetchStatus(`Error: ${response.status} ${response.statusText}`)
            }
        } catch (err: any) {
            setFetchStatus(`Fetch Error: ${err.message}`)
        }
    }

    async function checkSupabase() {
        // Test Local Client (Fresh Instance) FIRST
        try {
            const { createClient } = await import('@supabase/supabase-js')
            const url = import.meta.env.VITE_SUPABASE_URL
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY

            // Custom Memory Storage
            const memoryStorage = (() => {
                const map = new Map()
                return {
                    getItem: (key: string) => map.get(key) || null,
                    setItem: (key: string, value: string) => { map.set(key, value) },
                    removeItem: (key: string) => { map.delete(key) }
                }
            })()

            const localClient = createClient(url, key, {
                auth: {
                    storage: memoryStorage,
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                },
                global: {
                    fetch: (...args) => {
                        console.log('Local Fetch:', args[0])
                        return fetch(...args)
                    }
                }
            })

            const { error } = await localClient.from('profiles').select('count').limit(1)
            if (error) throw error
            setSupabaseStatus("Connected (Local Memory)")
        } catch (err: any) {
            setSupabaseStatus(`Error (Local): ${err.message}`)
        }

        // Test Global Client SECOND
        try {
            const { error } = await supabase.from('profiles').select('count').limit(1)
            if (error) throw error
            setSupabaseStatus(prev => `${prev} | Connected (Global)`)
        } catch (err: any) {
            setSupabaseStatus(prev => `${prev} | Error (Global): ${err.message}`)
        }

        const { data } = await supabase.auth.getSession()
        setSessionInfo(data.session)
    }

    const clearStorage = () => {
        localStorage.clear()
        window.location.reload()
    }

    return (
        <div className="p-8 space-y-4 font-mono text-sm">
            <h1 className="text-xl font-bold">Public Debug</h1>

            <div className="p-4 border rounded bg-slate-100 dark:bg-slate-900">
                <h2 className="font-bold mb-2">Auth Store State</h2>
                <pre>{JSON.stringify({
                    isLoading: authStore.isLoading,
                    isAdmin: authStore.isAdmin,
                    hasUser: !!authStore.user,
                    userEmail: authStore.user?.email,
                    profileRole: authStore.profile?.role
                }, null, 2)}</pre>
            </div>

            <div className="p-4 border rounded bg-slate-100 dark:bg-slate-900">
                <h2 className="font-bold mb-2">Supabase Connection (Client)</h2>
                <p>Status: {supabaseStatus}</p>
            </div>

            <div className="p-4 border rounded bg-slate-100 dark:bg-slate-900">
                <h2 className="font-bold mb-2">Direct Fetch (REST)</h2>
                <p>Status: {fetchStatus}</p>
            </div>

            <div className="p-4 border rounded bg-slate-100 dark:bg-slate-900">
                <h2 className="font-bold mb-2">Raw Session</h2>
                <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
            </div>

            <div className="flex gap-4">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => authStore.initialize()}
                >
                    Force Initialize
                </button>
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    onClick={clearStorage}
                >
                    Clear Storage & Reload
                </button>
            </div>
        </div>
    )
}
