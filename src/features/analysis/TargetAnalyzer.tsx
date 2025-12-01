import { useRef, type MouseEvent } from "react"
import { Upload, X, Target, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

export function TargetAnalyzer() {
    const { image, shots, setImage, addShot, removeShot, clearShots, reset, setAnalysisComplete } = useAnalysisStore()
    const { language } = useLanguageStore()
    const t = translations[language].analysis

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return

        const rect = imageRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        addShot({
            x,
            y,
            id: crypto.randomUUID(),
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    if (!image) {
        return (
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>{t.uploadTitle}</CardTitle>
                    <CardDescription>{t.uploadDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Instructions Steps */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                            <span className="text-xs text-muted-foreground">{t.step1}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                            <span className="text-xs text-muted-foreground">{t.step2}</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                            <span className="text-xs text-muted-foreground">{t.step3}</span>
                        </div>
                    </div>

                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.dragDrop}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t.formats}
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button variant="secondary">{t.selectImage}</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t.title}</CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={clearShots} disabled={shots.length === 0}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.clearShots}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={reset}>
                            <X className="h-4 w-4 mr-2" />
                            {t.resetImage}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full aspect-square max-h-[600px] bg-black/5 rounded-lg overflow-hidden mx-auto">
                        <div
                            className="relative w-full h-full cursor-crosshair"
                            onClick={handleImageClick}
                        >
                            <img
                                ref={imageRef}
                                src={image}
                                alt="Target"
                                className="w-full h-full object-contain pointer-events-none select-none"
                            />
                            {shots.map((shot) => (
                                <div
                                    key={shot.id}
                                    className="absolute w-4 h-4 -ml-2 -mt-2 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                                    style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeShot(shot.id)
                                    }}
                                >
                                    <Target className="w-3 h-3 text-white" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {t.shotsMarked} <span className="font-medium text-foreground">{shots.length}</span>
                        </div>
                        <Button disabled={shots.length < 3} onClick={() => setAnalysisComplete(true)}>
                            {t.generateReport}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
