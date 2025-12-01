import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { supabase } from "@/lib/supabase"

export function DebugAuth() {
    const { user, profile, isAdmin, isLoading } = useAuthStore()
    const [rawProfile, setRawProfile] = useState<any>(null)
    const [fetchError, setFetchError] = useState<any>(null)

    useEffect(() => {
        async function checkDirectly() {
            if (!user) return
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setRawProfile(data)
                setFetchError(error)
            } catch (err) {
                setFetchError(err)
            }
        }
        checkDirectly()
    }, [user])

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug Auth</h1>
            <div className="grid gap-4 p-4 border rounded bg-slate-50 dark:bg-slate-900">
                <div>
                    <strong>Store State:</strong>
                    <pre>{JSON.stringify({ isLoading, isAdmin, userEmail: user?.email }, null, 2)}</pre>
                </div>
                <div>
                    <strong>Profile in Store:</strong>
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
                <div>
                    <strong>Raw DB Fetch:</strong>
                    <pre>{JSON.stringify(rawProfile, null, 2)}</pre>
                </div>
                <div>
                    <strong>Fetch Error:</strong>
                    <pre>{JSON.stringify(fetchError, null, 2)}</pre>
                </div>
            </div>
        </div>
    )
}
