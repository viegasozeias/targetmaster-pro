import { useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalysisRecord } from "@/store/useAnalysisStore"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

interface DiagnosisChartProps {
    history: AnalysisRecord[]
}

export function DiagnosisChart({ history }: DiagnosisChartProps) {
    const { language } = useLanguageStore()
    const t = translations[language].dashboard

    const data = useMemo(() => {
        const counts: Record<string, number> = {}

        // Keywords for categorization (simple heuristic)
        const categories: Record<string, string[]> = {
            "trigger": ["gatilho", "trigger", "jerking", "dedo"],
            "grip": ["empunhadura", "grip", "tightening", "apertando", "mão"],
            "sight": ["visada", "sight", "foco", "olho", "eye", "mira"],
            "breathing": ["respiração", "breathing", "ar"],
            "anticipation": ["antecipação", "anticipating", "pushing", "heeling", "empurrando"],
            "stance": ["postura", "stance", "corpo"],
        }

        history.forEach((item) => {
            let diagnosisText = ""

            if (typeof item.diagnosis === 'string') {
                diagnosisText = item.diagnosis.toLowerCase()
            } else if (typeof item.diagnosis === 'object' && item.diagnosis !== null) {
                // @ts-ignore
                diagnosisText = (item.diagnosis.diagnosis || item.diagnosis.title || item.diagnosis.mainIssue || item.diagnosis.grouping || "").toLowerCase()
            }

            let categoryKey = "other"

            // Check for keywords
            for (const [key, keywords] of Object.entries(categories)) {
                if (keywords.some(k => diagnosisText.includes(k))) {
                    categoryKey = key
                    break
                }
            }

            counts[categoryKey] = (counts[categoryKey] || 0) + 1
        })

        return Object.entries(counts)
            .map(([key, value]) => ({
                // @ts-ignore
                name: t.categories[key] || t.categories.other,
                value
            }))
            .filter(item => item.name !== t.categories.other)
            .sort((a, b) => b.value - a.value)
    }, [history, t.categories])

    if (history.length === 0) {
        return null
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t.diagnosisTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            {t.diagnosis}
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].payload.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            {t.count}
                                                        </span>
                                                        <span className="font-bold">
                                                            {payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
