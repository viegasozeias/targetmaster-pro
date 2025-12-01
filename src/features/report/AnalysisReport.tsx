import { useEffect, useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { useDiagnosisStore } from "@/store/useDiagnosisStore"
import { useLanguageStore } from "@/store/useLanguageStore"

import { analyzeShots } from "@/lib/analysis"
import { translations } from "@/lib/translations"
import { generateAIAnalysis } from "@/lib/gemini"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCcw, Sparkles, AlertTriangle, CheckCircle2, Target, Stethoscope } from "lucide-react"

interface AIReport {
    diagnosis: string
    grouping: string
    corrections: string[]
    equipment: string | null
}

import { useAuthStore } from "@/store/useAuthStore"
import { Lock } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function AnalysisReport() {
    const { shots, center, image, reset, saveAnalysis } = useAnalysisStore()
    const { data: diagnosisData } = useDiagnosisStore()
    const { language } = useLanguageStore()
    const { profile } = useAuthStore()
    const t = translations[language].report
    const tResults = translations[language].report.results

    const [aiReport, setAiReport] = useState<AIReport | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isPro = profile?.subscription_tier === 'pro'

    const [systemApiKey, setSystemApiKey] = useState<string | null>(null)

    useEffect(() => {
        async function getApiKey() {
            const { data } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'google_gemini_api_key')
                .single()

            if (data?.value) setSystemApiKey(data.value)
        }
        getApiKey()
    }, [])

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (systemApiKey && image && diagnosisData && shots.length > 0 && isPro) {
                setLoading(true)
                setError(null)
                try {
                    const report = await generateAIAnalysis(systemApiKey, image, shots, diagnosisData, language, center)
                    setAiReport(report)

                    // Auto-save to history
                    const result = analyzeShots(shots, diagnosisData.handedness, center)
                    saveAnalysis(report, result.groupingSize)

                } catch (err) {
                    console.error(err)
                    setError("Failed to generate AI report. Please contact support.")
                } finally {
                    setLoading(false)
                }
            } else if (diagnosisData && shots.length > 0) {
                // Save manual analysis as well
                const result = analyzeShots(shots, diagnosisData.handedness, center)
                const manualDiagnosis = {
                    diagnosis: translations[language].report.results[result.diagnosisKey],
                    grouping: result.groupingSize > 30 ? "Scattered" : "Tight",
                    corrections: [translations[language].report.results[result.recommendationKey]],
                    equipment: null
                }
                saveAnalysis(manualDiagnosis, result.groupingSize)
            }
        }

        fetchAnalysis()
    }, [systemApiKey, image, diagnosisData, shots, center, language, saveAnalysis, isPro])

    if (!diagnosisData) return null

    const result = analyzeShots(shots, diagnosisData.handedness, center)

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary flex items-center gap-2">
                        {t.title}
                        {systemApiKey && <Sparkles className="h-5 w-5 text-yellow-500" />}
                    </CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                            <p className="text-muted-foreground animate-pulse">
                                {language === 'pt' ? 'Gerando análise detalhada com IA...' : 'Generating detailed AI analysis...'}
                            </p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : aiReport ? (
                        <div className="grid gap-4">
                            {/* Diagnosis Card */}
                            <Card className="bg-background/50 border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-blue-500" />
                                        {t.diagnosis}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{aiReport.diagnosis}</p>
                                </CardContent>
                            </Card>

                            {/* Grouping Analysis */}
                            <Card className="bg-background/50 border-l-4 border-l-purple-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-500" />
                                        {t.groupingSize}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{aiReport.grouping}</p>
                                </CardContent>
                            </Card>

                            {/* Corrections */}
                            <Card className="bg-background/50 border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        {t.recommendation}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {aiReport.corrections.map((correction, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                                <span>{correction}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Equipment/Health */}
                            {aiReport.equipment && (
                                <Card className="bg-background/50 border-l-4 border-l-orange-500">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                            {language === 'pt' ? 'Equipamento & Saúde' : 'Equipment & Health'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{aiReport.equipment}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : !isPro ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="bg-muted p-4 rounded-full">
                                <Lock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h3 className="text-lg font-semibold">
                                    {language === 'pt' ? 'Análise de IA Bloqueada' : 'AI Analysis Locked'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {language === 'pt'
                                        ? 'Faça o upgrade para o plano Pro para desbloquear análises detalhadas com Inteligência Artificial, correções personalizadas e muito mais.'
                                        : 'Upgrade to Pro plan to unlock detailed AI analysis, personalized corrections, and more.'}
                                </p>
                            </div>
                            <Link to="/profile#plans">
                                <Button className="mt-4">
                                    {language === 'pt' ? 'Desbloquear Pro' : 'Unlock Pro'}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{t.diagnosis}</h3>
                                <p className="text-xl font-bold text-foreground">
                                    {tResults[result.diagnosisKey]}
                                    {result.groupingSize > 30 && tResults.scattered}
                                </p>
                            </div>

                            <div className="bg-background/50 p-4 rounded-lg border">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{t.recommendation}</h3>
                                <p className="text-lg">
                                    {tResults[result.recommendationKey]}
                                    {result.groupingSize > 30 && tResults.scatteredRec}
                                </p>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
                        <div className="text-sm">
                            <span className="text-muted-foreground">{t.groupingSize}</span> <span className="font-mono">{result.groupingSize.toFixed(1)} units</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">{t.mpi}</span> <span className="font-mono">({result.mpi.x.toFixed(1)}, {result.mpi.y.toFixed(1)})</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.targetView}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-square bg-black/5 rounded-lg overflow-hidden">
                            {image && (
                                <img
                                    src={image}
                                    alt="Target"
                                    className="w-full h-full object-contain"
                                />
                            )}
                            {/* Center Point */}
                            {center && (
                                <div
                                    className="absolute w-6 h-6 -ml-3 -mt-3 text-yellow-500 pointer-events-none"
                                    style={{ left: `${center.x}%`, top: `${center.y}%` }}
                                >
                                    <Target className="w-full h-full drop-shadow-md" strokeWidth={3} />
                                </div>
                            )}
                            {shots.map((shot) => (
                                <div
                                    key={shot.id}
                                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-red-500 rounded-full border border-white shadow-sm"
                                    style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
                                />
                            ))}
                            {/* Show MPI */}
                            <div
                                className="absolute w-4 h-4 -ml-2 -mt-2 border-2 border-blue-500 rounded-full flex items-center justify-center"
                                style={{ left: `${result.mpi.x}%`, top: `${result.mpi.y}%` }}
                            >
                                <div className="w-0.5 h-full bg-blue-500 absolute" />
                                <div className="h-0.5 w-full bg-blue-500 absolute" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.shooterProfile}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">{t.handedness}</span>
                            <span className="capitalize">{diagnosisData.handedness === 'right' ? translations[language].diagnosis.right : translations[language].diagnosis.left}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">{t.eyeDominance}</span>
                            <span className="capitalize">{diagnosisData.eyeDominance === 'right' ? translations[language].diagnosis.right : translations[language].diagnosis.left}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">{t.firearm}</span>
                            <span>{diagnosisData.firearmModel} ({diagnosisData.caliber})</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">{t.experience}</span>
                            <span className="capitalize">{(translations[language].diagnosis as any)[diagnosisData.shootingExperience] || diagnosisData.shootingExperience}</span>
                        </div>
                        {diagnosisData.visionIssues && (
                            <div className="flex flex-col border-b pb-2">
                                <span className="text-muted-foreground mb-1">{t.visionIssues}</span>
                                <span>{diagnosisData.visionIssues}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-6">
                <Button size="lg" onClick={reset} variant="outline">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {translations[language].app.analyzeNew}
                </Button>
            </div>
        </div>
    )
}
