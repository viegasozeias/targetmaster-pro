import { type Firearm, useArsenalStore } from "@/store/useArsenalStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wrench } from "lucide-react"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

interface FirearmCardProps {
    firearm: Firearm
}

export function FirearmCard({ firearm }: FirearmCardProps) {
    const { updateRoundCount } = useArsenalStore()
    const { language } = useLanguageStore()
    const t = translations[language].arsenal

    const handleAddRounds = async () => {
        const rounds = prompt("How many rounds did you fire?")
        if (rounds && !isNaN(Number(rounds))) {
            await updateRoundCount(firearm.id, firearm.round_count + Number(rounds))
        }
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{firearm.make} {firearm.model}</CardTitle>
                        <p className="text-sm text-muted-foreground">{firearm.caliber}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Wrench className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">{t.roundCount}</p>
                            <p className="text-2xl font-mono">{firearm.round_count}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleAddRounds}>
                            <Plus className="h-4 w-4 mr-1" /> {t.add}
                        </Button>
                    </div>
                    {firearm.serial_number && (
                        <p className="text-xs text-muted-foreground">SN: {firearm.serial_number}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
