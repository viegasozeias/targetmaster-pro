import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguageStore } from "@/store/useLanguageStore"
import type { AnalysisRecord } from "@/store/useAnalysisStore"
import { translations } from "@/lib/translations"

interface AccuracyTargetProps {
    history: AnalysisRecord[]
}

export function AccuracyTarget({ history }: AccuracyTargetProps) {
    const { language } = useLanguageStore()

    const shots = useMemo(() => {
        // Flatten all shots from history
        return history.flatMap(record => {
            // Check if diagnosis has shots data (new format)
            if (record.diagnosis && Array.isArray(record.diagnosis.shots)) {
                return record.diagnosis.shots.map((shot: any) => ({
                    x: shot.x,
                    y: shot.y,
                    date: record.created_at
                }))
            }
            return []
        })
    }, [history])

    // If no shots data available yet, show placeholder
    if (shots.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{language === 'pt' ? 'Precisão no Alvo' : 'Target Accuracy'}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground text-center p-6">
                    {language === 'pt'
                        ? 'Faça novas análises para ver seus disparos acumulados aqui.'
                        : 'Perform new analyses to see your accumulated shots here.'}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{language === 'pt' ? 'Precisão no Alvo' : 'Target Accuracy'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <div className="relative w-[280px] h-[280px] border rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden shadow-inner">
                        {/* Target Rings */}
                        <div className="absolute inset-0 m-auto w-[90%] h-[90%] border border-neutral-300 rounded-full" />
                        <div className="absolute inset-0 m-auto w-[70%] h-[70%] border border-neutral-300 rounded-full" />
                        <div className="absolute inset-0 m-auto w-[50%] h-[50%] border border-neutral-300 rounded-full" />
                        <div className="absolute inset-0 m-auto w-[30%] h-[30%] border border-neutral-300 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <div className="absolute inset-0 m-auto w-[10%] h-[10%] bg-red-500 rounded-full shadow-sm" />

                        {/* Crosshairs */}
                        <div className="absolute inset-0 m-auto w-full h-[1px] bg-neutral-300/50" />
                        <div className="absolute inset-0 m-auto h-full w-[1px] bg-neutral-300/50" />

                        {/* Shots */}
                        {shots.map((shot, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-primary rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                                style={{
                                    left: `${shot.x}%`,
                                    top: `${shot.y}%`,
                                }}
                                title={new Date(shot.date).toLocaleDateString()}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
