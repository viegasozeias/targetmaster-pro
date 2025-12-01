import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDrillsStore } from "@/store/useDrillsStore"
import { Loader2 } from "lucide-react"

interface DrillLogFormProps {
    drillId: string
    onSuccess: () => void
}

export function DrillLogForm({ drillId, onSuccess }: DrillLogFormProps) {
    const { logAttempt } = useDrillsStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [score, setScore] = useState("")
    const [time, setTime] = useState("")
    const [notes, setNotes] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await logAttempt(drillId, Number(score), Number(time), notes)
            onSuccess()
        } catch (error) {
            // Error handling is done in store
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t pt-4">
            <h4 className="font-semibold">Log Attempt</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="score">Score/Points</Label>
                    <Input
                        id="score"
                        type="number"
                        placeholder="e.g. 45"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Time (seconds)</Label>
                    <Input
                        id="time"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 5.23"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="How did it feel? What needs improvement?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Log
            </Button>
        </form>
    )
}
