import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Drill } from "@/store/useDrillsStore"
import { DrillLogForm } from "./DrillLogForm"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

interface DrillDetailDialogProps {
    drill: Drill | null
    isOpen: boolean
    onClose: () => void
}

export function DrillDetailDialog({ drill, isOpen, onClose }: DrillDetailDialogProps) {
    const { language } = useLanguageStore()
    const t = translations[language].drills

    if (!drill) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={drill.difficulty === 'beginner' ? 'secondary' : drill.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                            {drill.difficulty === 'beginner' ? t.beginner : drill.difficulty === 'intermediate' ? t.intermediate : t.advanced}
                        </Badge>
                        <Badge variant="outline">{drill.category}</Badge>
                    </div>
                    <DialogTitle>{drill.title}</DialogTitle>
                    <DialogDescription>
                        {drill.description}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 py-4">
                        <div>
                            <h4 className="font-semibold mb-2">{t.instructions}</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {drill.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ul>
                        </div>

                        <DrillLogForm drillId={drill.id} onSuccess={onClose} />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
