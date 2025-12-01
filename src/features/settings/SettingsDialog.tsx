import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useLanguageStore } from "@/store/useLanguageStore"

export function SettingsDialog() {
    const { language, setLanguage } = useLanguageStore()
    const [open, setOpen] = useState(false)

    const handleSave = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{language === 'pt' ? 'Configurações' : 'Settings'}</DialogTitle>
                    <DialogDescription>
                        {language === 'pt'
                            ? 'Insira sua chave da API do Google Gemini para habilitar recursos de IA.'
                            : 'Enter your Google Gemini API Key to enable AI features.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="language" className="text-right">
                            {language === 'pt' ? 'Idioma' : 'Language'}
                        </Label>
                        <Select
                            value={language}
                            onValueChange={(value) => setLanguage(value as 'pt' | 'en')}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pt">Português (Brasil)</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>
                        {language === 'pt' ? 'Salvar' : 'Save'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
