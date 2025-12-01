import { useEffect, useMemo } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Target, TrendingUp, AlertCircle, Trophy } from "lucide-react"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLanguageStore } from "@/store/useLanguageStore"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProgressionChart } from "./ProgressionChart"
import { DiagnosisChart } from "./DiagnosisChart"
import { translations } from "@/lib/translations"

import { HistoryDetailsDialog } from "@/features/history/HistoryDetailsDialog"
import { useState } from "react"

export function Dashboard() {
    const { history, isLoadingHistory, fetchHistory } = useAnalysisStore()
    const { language } = useLanguageStore()
    const locale = language === "pt" ? ptBR : enUS
    const t = translations[language].dashboard

    const [selectedRecord, setSelectedRecord] = useState<any>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const stats = useMemo(() => {
        if (history.length === 0) return null

        const total = history.length
        const avgGrouping = history.reduce((acc, curr) => acc + curr.grouping_size, 0) / total
        const bestGrouping = Math.min(...history.map(h => h.grouping_size))

        // Find most frequent diagnosis
        const counts: Record<string, number> = {}

        // Keywords for categorization (same as DiagnosisChart)
        const categories = {
            "Gatilho": ["gatilho", "trigger", "jerking", "dedo"],
            "Empunhadura": ["empunhadura", "grip", "tightening", "apertando", "mão"],
            "Visada": ["visada", "sight", "foco", "olho", "eye", "mira"],
            "Respiração": ["respiração", "breathing", "ar"],
            "Antecipação": ["antecipação", "anticipating", "pushing", "heeling", "empurrando"],
            "Postura": ["postura", "stance", "corpo"],
        }

        history.forEach(h => {
            let label = ""
            if (typeof h.diagnosis === 'string') {
                label = h.diagnosis.toLowerCase()
            } else if (typeof h.diagnosis === 'object' && h.diagnosis !== null) {
                // @ts-ignore
                label = (h.diagnosis.diagnosis || h.diagnosis.title || h.diagnosis.mainIssue || h.diagnosis.grouping || "").toLowerCase()
            }

            let category = "Outros"
            for (const [cat, keywords] of Object.entries(categories)) {
                if (keywords.some(k => label.includes(k))) {
                    category = cat
                    break
                }
            }
            counts[category] = (counts[category] || 0) + 1
        })
        const mostFrequent = Object.entries(counts)
            .filter(([name]) => name !== "Outros")
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

        return { total, avgGrouping, bestGrouping, mostFrequent }
    }, [history])

    if (isLoadingHistory) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <Link to="/analysis/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t.newAnalysis}
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.totalAnalyses}</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.avgGrouping}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.avgGrouping.toFixed(1) || 0}</div>
                        <p className="text-xs text-muted-foreground">{t.units}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.bestGrouping}</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.bestGrouping.toFixed(1) || 0}</div>
                        <p className="text-xs text-muted-foreground">{t.units}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t.commonIssue}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={stats?.mostFrequent}>{stats?.mostFrequent || "N/A"}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <ProgressionChart history={history} />
                </div>
                <div className="col-span-3">
                    <DiagnosisChart history={history} />
                </div>
            </div>

            {/* Recent History List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">{t.recentHistory}</h2>
                    <Link to="/history">
                        <Button variant="link" className="text-sm text-muted-foreground">
                            {language === 'pt' ? 'Ver todos' : 'View all'}
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {history.slice(0, 3).map((record) => (
                        <Card
                            key={record.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedRecord(record)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(record.created_at), "PPP", { locale })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t.grouping}:</span>
                                        <span className="font-medium">{record.grouping_size.toFixed(1)} {t.units}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {typeof record.diagnosis === 'string'
                                            ? record.diagnosis
                                            // @ts-ignore
                                            : (record.diagnosis?.diagnosis || record.diagnosis?.grouping || "No diagnosis available")}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {history.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        {t.noAnalyses}
                    </div>
                )}
            </div>

            <HistoryDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    )
}
