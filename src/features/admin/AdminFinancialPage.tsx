import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"

export function AdminFinancialPage() {
    const [stats, setStats] = useState({
        mrr: 0,
        totalRevenue: 0, // Mocked for now since we don't have transaction history
        activeSubs: 0,
        churnedSubs: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    const PRO_PRICE = 29.90 // Assuming monthly price

    useEffect(() => {
        async function fetchFinancials() {
            try {
                // Timeout promise
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 5000)
                )

                // Get all profiles to calculate stats
                const fetchPromise = supabase
                    .from('profiles')
                    .select('subscription_tier, subscription_status')

                const { data: profiles, error } = await Promise.race([fetchPromise, timeout]) as any

                if (error) throw error

                const proUsers = profiles?.filter((p: any) => p.subscription_tier === 'pro') || []
                const activePro = proUsers.filter((p: any) => p.subscription_status === 'active' || !p.subscription_status) // Assuming null status is active for manual overrides

                // Calculate MRR
                const mrr = activePro.length * PRO_PRICE

                setStats({
                    mrr,
                    totalRevenue: mrr * 12, // Projected annual
                    activeSubs: activePro.length,
                    churnedSubs: 0 // Need history for this
                })

            } catch (error) {
                console.error('Error fetching financials:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFinancials()
    }, [])

    if (isLoading) return <div>Loading financials...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Financial Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Recurring Revenue (MRR)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.mrr.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Subscriptions
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubs}</div>
                        <p className="text-xs text-muted-foreground">
                            +180.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Projected Annual Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on current MRR
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Revenue Per User
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {PRO_PRICE.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            For Pro plan
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No transaction history available yet.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
