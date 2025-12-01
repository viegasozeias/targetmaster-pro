import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguageStore } from "@/store/useLanguageStore"
import type { AnalysisRecord } from "@/store/useAnalysisStore"

interface AccuracyTargetProps {
    history: AnalysisRecord[]
}

export function AccuracyTarget({ history }: AccuracyTargetProps) {
    const { language } = useLanguageStore()

    const shots = useMemo(() => {
        return history.flatMap(record => {
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

    // Heatmap Logic
    const heatmapData = useMemo(() => {
        const gridSize = 20 // 20x20 grid
        const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0))
        let maxCount = 0

        shots.forEach(shot => {
            const col = Math.min(Math.floor((shot.x / 100) * gridSize), gridSize - 1)
            const row = Math.min(Math.floor((shot.y / 100) * gridSize), gridSize - 1)
            grid[row][col]++
            maxCount = Math.max(maxCount, grid[row][col])
        })

        return { grid, maxCount, gridSize }
    }, [shots])

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
                <CardTitle>{language === 'pt' ? 'Precisão no Alvo (Mapa de Calor)' : 'Target Accuracy (Heatmap)'}</CardTitle>
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

                        {/* Heatmap Layer */}
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${heatmapData.gridSize}, 1fr)`, gridTemplateRows: `repeat(${heatmapData.gridSize}, 1fr)` }}>
                            {heatmapData.grid.map((row, rowIndex) =>
                                row.map((count, colIndex) => {
                                    if (count === 0) return <div key={`${rowIndex}-${colIndex}`} />

                                    // Calculate intensity (0.2 to 0.8 opacity)
                                    const intensity = 0.2 + (count / heatmapData.maxCount) * 0.6

                                    return (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className="bg-red-500 blur-md rounded-full transform scale-150"
                                            style={{ opacity: intensity }}
                                            title={`${count} shots`}
                                        />
                                    )
                                })
                            )}
                        </div>

                        {/* Individual Shots (Optional overlay for detail) */}
                        {shots.map((shot, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-black/30 rounded-full"
                                style={{
                                    left: `${shot.x}%`,
                                    top: `${shot.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
