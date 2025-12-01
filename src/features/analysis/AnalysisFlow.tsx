import { useEffect } from "react"
import { useDiagnosisStore } from "@/store/useDiagnosisStore"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { DiagnosisForm } from "@/features/diagnosis/DiagnosisForm"
import { TargetAnalyzer } from "@/features/analysis/TargetAnalyzer"
import { AnalysisReport } from "@/features/report/AnalysisReport"
import { Loader2 } from "lucide-react"

export function AnalysisFlow() {
    const { data: diagnosisData, fetchProfile, isLoading: isProfileLoading } = useDiagnosisStore()
    const { isAnalysisComplete } = useAnalysisStore()

    useEffect(() => {
        // Reset analysis state when starting new flow
        // But we don't want to reset if we are already in the middle of it?
        // Actually, when mounting this component (e.g. via /analysis/new), we should probably reset.
        // Let's rely on the user clicking "New Analysis" which should trigger a reset or route change.

        if (!diagnosisData) {
            fetchProfile()
        }
    }, [])

    if (isProfileLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Flow Logic:
    // 1. If no profile data -> Show Diagnosis Form (which saves to store, and optionally to DB if we updated it)
    // 2. If profile data -> Show Target Analyzer
    // 3. If analysis complete -> Show Report

    if (!diagnosisData) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Shooter Profile Required</h2>
                    <p className="text-muted-foreground">Please complete your profile to continue.</p>
                </div>
                <DiagnosisForm />
            </div>
        )
    }

    if (isAnalysisComplete) {
        return <AnalysisReport />
    }

    return <TargetAnalyzer />
}
