import { useEffect } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"


import { useState } from "react"
import { HistoryDetailsDialog } from "./HistoryDetailsDialog"
import type { AnalysisRecord } from "@/store/useAnalysisStore"

export function HistoryPage() {
    const { history, isLoadingHistory, fetchHistory } = useAnalysisStore()
    const { language } = useLanguageStore()
    const locale = language === "pt" ? ptBR : enUS
    const t = translations[language].dashboard // Reusing dashboard translations for now

    const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

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
                <h1 className="text-3xl font-bold tracking-tight">{language === 'pt' ? 'Histórico de Análises' : 'Analysis History'}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((record) => (
                    <Card
                        key={record.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedRecord(record)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(record.created_at), "PPP p", { locale })}
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
                <div className="text-center py-12 text-muted-foreground">
                    {t.noAnalyses}
                </div>
            )}

            <HistoryDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    )
}
