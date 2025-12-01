import { useEffect, useState } from "react"
import { useArsenalStore } from "@/store/useArsenalStore"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { FirearmCard } from "./FirearmCard"
import { AmmoList } from "./AmmoList"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

export function ArsenalPage() {
    const { firearms, ammo, fetchArsenal, addFirearm, addAmmo } = useArsenalStore()
    const [isAddFirearmOpen, setIsAddFirearmOpen] = useState(false)
    const [isAddAmmoOpen, setIsAddAmmoOpen] = useState(false)
    const { language } = useLanguageStore()
    const t = translations[language].arsenal

    useEffect(() => {
        fetchArsenal()
    }, [])

    const handleAddFirearm = async (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        await addFirearm({
            make: formData.get('make') as string,
            model: formData.get('model') as string,
            caliber: formData.get('caliber') as string,
            serial_number: formData.get('serial') as string,
            round_count: 0,
            last_maintenance_date: null,
            image_url: null
        })
        setIsAddFirearmOpen(false)
    }

    const handleAddAmmo = async (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        await addAmmo({
            caliber: formData.get('caliber') as string,
            brand: formData.get('brand') as string,
            grain: Number(formData.get('grain')),
            quantity: Number(formData.get('quantity'))
        })
        setIsAddAmmoOpen(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-muted-foreground">{t.subtitle}</p>
            </div>

            <Tabs defaultValue="firearms" className="w-full">
                <TabsList>
                    <TabsTrigger value="firearms">{t.firearms}</TabsTrigger>
                    <TabsTrigger value="ammo">{t.ammo}</TabsTrigger>
                </TabsList>

                <TabsContent value="firearms" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isAddFirearmOpen} onOpenChange={setIsAddFirearmOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> {t.addFirearm}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.addFirearm}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddFirearm} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t.make}</Label>
                                            <Input name="make" placeholder="e.g. Glock" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.model}</Label>
                                            <Input name="model" placeholder="e.g. 19 Gen 5" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t.caliber}</Label>
                                            <Input name="caliber" placeholder="e.g. 9mm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.serialNumber}</Label>
                                            <Input name="serial" placeholder={t.optional} />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full">{t.saveFirearm}</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {firearms.map(f => (
                            <FirearmCard key={f.id} firearm={f} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ammo" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isAddAmmoOpen} onOpenChange={setIsAddAmmoOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> {t.addAmmo}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.addAmmo}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddAmmo} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t.caliber}</Label>
                                            <Input name="caliber" placeholder="e.g. 9mm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.brand}</Label>
                                            <Input name="brand" placeholder="e.g. Magtech" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t.grain}</Label>
                                            <Input name="grain" type="number" placeholder="124" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.quantity}</Label>
                                            <Input name="quantity" type="number" placeholder="50" required />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full">{t.addToInventory}</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <AmmoList ammo={ammo} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
