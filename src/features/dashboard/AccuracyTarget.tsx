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
        const gridSize = 30 // Increased resolution
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

    // Color scale function - More vivid/striking
    const getColor = (intensity: number) => {
        // Transparent -> Blue -> Green -> Yellow -> Red
        if (intensity < 0.1) return `rgba(0, 0, 255, 0)` // Transparent for very low
        if (intensity < 0.3) return `rgba(0, 100, 255, ${0.4 + intensity})` // Vivid Blue
        if (intensity < 0.5) return `rgba(0, 255, 100, ${0.5 + intensity})` // Vivid Green
        if (intensity < 0.7) return `rgba(255, 200, 0, ${0.6 + intensity})` // Vivid Yellow
        return `rgba(255, 0, 0, ${0.7 + intensity})` // Vivid Red
    }

    // Calculate General Tendency (MPI of all shots)
    const tendency = useMemo(() => {
        if (shots.length === 0) return null
        const totalX = shots.reduce((sum, s) => sum + s.x, 0)
        const totalY = shots.reduce((sum, s) => sum + s.y, 0)
        const mpiX = totalX / shots.length
        const mpiY = totalY / shots.length

        const dx = mpiX - 50
        const dy = mpiY - 50
        const threshold = 5 // Tight center threshold

        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
            return language === 'pt' ? 'Centralizado' : 'Centered'
        }

        let vertical = ""
        let horizontal = ""

        if (Math.abs(dy) >= threshold) {
            vertical = dy > 0 ? (language === 'pt' ? 'Baixo' : 'Low') : (language === 'pt' ? 'Alto' : 'High')
        }
        if (Math.abs(dx) >= threshold) {
            horizontal = dx > 0 ? (language === 'pt' ? 'Direita' : 'Right') : (language === 'pt' ? 'Esquerda' : 'Left')
        }

        return `${vertical} ${horizontal}`.trim()
    }, [shots, language])

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
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>{language === 'pt' ? 'Precisão no Alvo (Mapa de Calor)' : 'Target Accuracy (Heatmap)'}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative w-[240px] h-[240px] border rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden shadow-inner">
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

                                const intensity = count / heatmapData.maxCount
                                const color = getColor(intensity)

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className="blur-md rounded-full transform scale-150"
                                        style={{ backgroundColor: color }}
                                        title={`${count} shots`}
                                    />
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Tendency Diagnosis */}
                {tendency && (
                    <div className="text-center bg-muted/50 px-4 py-2 rounded-lg border w-full">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {language === 'pt' ? 'Tendência Geral' : 'General Tendency'}
                        </span>
                        <p className="text-lg font-bold text-primary mt-1">
                            {tendency}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
