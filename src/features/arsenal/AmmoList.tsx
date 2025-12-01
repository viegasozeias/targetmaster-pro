import { type AmmoBatch, useArsenalStore } from "@/store/useArsenalStore"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

interface AmmoListProps {
    ammo: AmmoBatch[]
}

export function AmmoList({ ammo }: AmmoListProps) {
    const { updateAmmoQuantity } = useArsenalStore()
    const { language } = useLanguageStore()
    const t = translations[language].arsenal

    return (
        <div className="space-y-4">
            {ammo.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                        <h4 className="font-semibold">{batch.caliber}</h4>
                        <p className="text-sm text-muted-foreground">{batch.brand} - {batch.grain}gr</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateAmmoQuantity(batch.id, Math.max(0, batch.quantity - 50))}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-16 text-center font-mono font-bold">{batch.quantity}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateAmmoQuantity(batch.id, batch.quantity + 50)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            ))}
            {ammo.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    {t.noAmmo}
                </div>
            )}
        </div>
    )
}
