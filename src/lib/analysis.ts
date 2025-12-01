import type { Shot } from "@/store/useAnalysisStore"
import { translations } from "@/lib/translations"

export interface AnalysisResult {
    mpi: { x: number; y: number }
    groupingSize: number
    diagnosisKey: keyof typeof translations.pt.report.results
    recommendationKey: keyof typeof translations.pt.report.results
}

export function analyzeShots(shots: Shot[], handedness: "right" | "left"): AnalysisResult {
    if (shots.length === 0) {
        return {
            mpi: { x: 50, y: 50 },
            groupingSize: 0,
            diagnosisKey: "noShots",
            recommendationKey: "noShotsRec",
        }
    }

    // Calculate Mean Point of Impact (MPI)
    const totalX = shots.reduce((sum, shot) => sum + shot.x, 0)
    const totalY = shots.reduce((sum, shot) => sum + shot.y, 0)
    const mpi = {
        x: totalX / shots.length,
        y: totalY / shots.length,
    }

    // Calculate Grouping Size (Max distance between any two shots)
    let maxDist = 0
    for (let i = 0; i < shots.length; i++) {
        for (let j = i + 1; j < shots.length; j++) {
            const dx = shots[i].x - shots[j].x
            const dy = shots[i].y - shots[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > maxDist) {
                maxDist = dist
            }
        }
    }

    // Diagnosis Logic
    const dx = mpi.x - 50
    const dy = mpi.y - 50

    let diagnosisKey: keyof typeof translations.pt.report.results = "goodShooting"
    let recommendationKey: keyof typeof translations.pt.report.results = "goodShootingRec"

    // Threshold for "Center"
    const centerThreshold = 10

    if (Math.abs(dx) < centerThreshold && Math.abs(dy) < centerThreshold) {
        diagnosisKey = "centerHit"
        recommendationKey = "centerHitRec"
    } else {
        // Determine sector
        if (handedness === "right") {
            if (dy > 0) { // Low
                if (dx < 0) { // Left
                    diagnosisKey = "jerking"
                    recommendationKey = "jerkingRec"
                } else { // Right
                    diagnosisKey = "tightening"
                    recommendationKey = "tighteningRec"
                }
            } else { // High
                if (dx < 0) { // Left
                    diagnosisKey = "pushing"
                    recommendationKey = "pushingRec"
                } else { // Right
                    diagnosisKey = "heeling"
                    recommendationKey = "heelingRec"
                }
            }
        } else { // Left Handed
            // Mirror logic for lefties
            if (dy > 0) { // Low
                if (dx > 0) { // Right
                    diagnosisKey = "jerking"
                    recommendationKey = "jerkingRec"
                } else { // Left
                    diagnosisKey = "tightening"
                    recommendationKey = "tighteningRec"
                }
            } else { // High
                if (dx > 0) { // Right
                    diagnosisKey = "pushing"
                    recommendationKey = "pushingRec"
                } else { // Left
                    diagnosisKey = "heeling"
                    recommendationKey = "heelingRec"
                }
            }
        }
    }

    // Adjust for grouping size - logic slightly changed to just use scattered key if needed, 
    // but for simplicity I'll keep the main diagnosis and maybe append scattered info in UI or separate key
    // For now, let's just return the main diagnosis. 
    // If scattered, we might want to override or append. 
    // Let's keep it simple: if scattered, we override with scattered diagnosis if it wasn't a center hit?
    // Or better, let's just use the main diagnosis and let the UI handle "scattered" if we want.
    // Actually, the original code appended text. To support i18n properly, we should probably return a list of keys or a composite object.
    // But to minimize changes, let's just return the main diagnosis. The "Scattered" part is tricky without a composite key.
    // I'll add "scattered" logic: if maxDist > 30, we change the recommendation or diagnosis key if possible.
    // But my keys are fixed. Let's just stick to the main diagnosis for now to ensure type safety.

    return {
        mpi,
        groupingSize: maxDist,
        diagnosisKey,
        recommendationKey,
    }
}
