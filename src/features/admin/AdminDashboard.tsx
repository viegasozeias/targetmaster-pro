import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, ShieldCheck } from "lucide-react"

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        proUsers: 0,
        totalDrills: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        async function fetchStats() {
            try {
                console.log('AdminDashboard: fetching stats...')

                // Create a timeout promise (5 seconds)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 5000)
                )

                // Wrap Supabase calls in a promise that races with timeout
                const fetchData = async () => {
                    // Fetch users count
                    const { count: totalUsers, error: usersError } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })

                    if (usersError) throw usersError

                    // Fetch pro users count
                    const { count: proUsers, error: proError } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('subscription_tier', 'pro')

                    if (proError) throw proError

                    // Fetch drills count
                    const { count: totalDrills, error: drillsError } = await supabase
                        .from('drills')
                        .select('*', { count: 'exact', head: true })

                    if (drillsError) throw drillsError

                    return { totalUsers, proUsers, totalDrills }
                }

                const data = await Promise.race([fetchData(), timeoutPromise]) as any

                if (mounted) {
                    setStats({
                        totalUsers: data.totalUsers || 0,
                        proUsers: data.proUsers || 0,
                        totalDrills: data.totalDrills || 0
                    })
                }
            } catch (error: any) {
                console.error('Error fetching admin stats:', error)
                if (mounted) setError(error.message || 'Failed to load stats')
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        fetchStats()
        return () => { mounted = false }
    }, [])

    if (isLoading) return <div>Loading stats... (Check console if stuck)</div>
    if (error) return <div className="text-red-500">Error: {error}</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pro Subscribers
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.proUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Drills
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDrills}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
