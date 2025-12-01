import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuthStore()
    const navigate = useNavigate()

    // Removed redundant initialize() call since App.tsx handles it globally


    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/auth")
        }
    }, [user, isLoading, navigate])

    const [showRetry, setShowRetry] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoading) setShowRetry(true)
        }, 3000)
        return () => clearTimeout(timer)
    }, [isLoading])

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading...</p>
                {showRetry && (
                    <div className="flex flex-col gap-2 items-center animate-in fade-in">
                        <p className="text-sm text-muted-foreground">Taking longer than expected?</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </div>
                )}
                <div className="p-4 bg-muted rounded text-xs font-mono text-left opacity-50 hover:opacity-100 transition-opacity">
                    <p>Debug Info:</p>
                    <p>User: {user ? user.email : 'null'}</p>
                    <p>IsLoading: {String(isLoading)}</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}
