import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"
import type { AnalysisRecord } from "@/store/useAnalysisStore"
import { Target, Stethoscope, CheckCircle2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HistoryDetailsDialogProps {
    isOpen: boolean
    onClose: () => void
    record: AnalysisRecord | null
}

export function HistoryDetailsDialog({ isOpen, onClose, record }: HistoryDetailsDialogProps) {
    const { language } = useLanguageStore()
    const locale = language === "pt" ? ptBR : enUS
    const t = translations[language].report
    const tDash = translations[language].dashboard

    if (!record) return null

    // Parse diagnosis if it's a string (legacy) or use as is
    let diagnosisData: any = {}
    if (typeof record.diagnosis === 'string') {
        diagnosisData = { diagnosis: record.diagnosis }
    } else {
        diagnosisData = record.diagnosis || {}
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {format(new Date(record.created_at), "PPP p", { locale })}
                    </DialogTitle>
                    <DialogDescription>
                        {tDash.grouping}: <span className="font-mono font-medium text-foreground">{record.grouping_size.toFixed(1)} {tDash.units}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-1">
                    <div className="space-y-4 py-4 pr-4">
                        {/* Diagnosis */}
                        <Card className="bg-background/50 border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-500" />
                                    {t.diagnosis}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{diagnosisData.diagnosis || diagnosisData.title || diagnosisData.mainIssue || "N/A"}</p>
                            </CardContent>
                        </Card>

                        {/* Grouping Analysis (if available) */}
                        {diagnosisData.grouping && (
                            <Card className="bg-background/50 border-l-4 border-l-purple-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-500" />
                                        {t.groupingSize}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{diagnosisData.grouping}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Corrections (if available) */}
                        {diagnosisData.corrections && Array.isArray(diagnosisData.corrections) && (
                            <Card className="bg-background/50 border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        {t.recommendation}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {diagnosisData.corrections.map((correction: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                                <span>{correction}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Equipment (if available) */}
                        {diagnosisData.equipment && (
                            <Card className="bg-background/50 border-l-4 border-l-orange-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        {language === 'pt' ? 'Equipamento & Saúde' : 'Equipment & Health'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{diagnosisData.equipment}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onClose}>
                        {language === 'pt' ? 'Fechar' : 'Close'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
