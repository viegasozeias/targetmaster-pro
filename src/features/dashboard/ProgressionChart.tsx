import { useMemo } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLanguageStore } from "@/store/useLanguageStore"
import type { AnalysisRecord } from "@/store/useAnalysisStore"
import { translations } from "@/lib/translations"

interface ProgressionChartProps {
    history: AnalysisRecord[]
}

export function ProgressionChart({ history }: ProgressionChartProps) {
    const { language } = useLanguageStore()
    const locale = language === "pt" ? ptBR : enUS
    const t = translations[language].dashboard

    const data = useMemo(() => {
        // Sort by date ascending for the chart
        return [...history]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((item) => ({
                timestamp: item.created_at, // Unique key for XAxis
                date: format(new Date(item.created_at), "dd/MM", { locale }),
                fullDate: format(new Date(item.created_at), "PPP p", { locale }),
                grouping: item.grouping_size,
            }))
    }, [history, locale])

    if (history.length < 2) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t.progressionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                    {t.noAnalyses}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t.progressionTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="timestamp"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => format(new Date(value), "dd/MM", { locale })}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${Number(value).toFixed(1)}`}
                                reversed={true}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            {t.date}
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].payload.fullDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            {t.grouping}
                                                        </span>
                                                        <span className="font-bold">
                                                            {Number(payload[0].value).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="grouping"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                            <ReferenceLine
                                y={15}
                                stroke="hsl(var(--destructive))"
                                strokeDasharray="3 3"
                                label={{
                                    value: t.goal || "Meta (15)",
                                    position: 'insideBottomRight',
                                    fill: 'hsl(var(--destructive))',
                                    fontSize: 12
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2">
                        <p className="text-xs text-muted-foreground">{t.lowerIsBetter}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
