import { useEffect, useState } from "react"
import { useDrillsStore, type Drill } from "@/store/useDrillsStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { DrillDetailDialog } from "./DrillDetailDialog"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

export function DrillsPage() {
    const { drills, fetchDrills, isLoading } = useDrillsStore()
    const [search, setSearch] = useState("")
    const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
    const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
    const { language } = useLanguageStore()
    const t = translations[language].drills

    useEffect(() => {
        fetchDrills()
    }, [])

    const filteredDrills = drills.filter(drill => {
        const matchesSearch = drill.title.toLowerCase().includes(search.toLowerCase()) ||
            drill.description.toLowerCase().includes(search.toLowerCase())
        const matchesDifficulty = filterDifficulty === "all" || drill.difficulty === filterDifficulty
        return matchesSearch && matchesDifficulty
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                    <p className="text-muted-foreground">{t.subtitle}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t.searchPlaceholder}
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={t.difficulty} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.allLevels}</SelectItem>
                        <SelectItem value="beginner">{t.beginner}</SelectItem>
                        <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                        <SelectItem value="advanced">{t.advanced}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-32 bg-muted/50" />
                            <CardContent className="h-24 bg-muted/30" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrills.map((drill) => (
                        <Card
                            key={drill.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => setSelectedDrill(drill)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={drill.difficulty === 'beginner' ? 'secondary' : drill.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                                        {drill.difficulty === 'beginner' ? t.beginner : drill.difficulty === 'intermediate' ? t.intermediate : t.advanced}
                                    </Badge>
                                    <Badge variant="outline">{drill.category}</Badge>
                                </div>
                                <CardTitle>{drill.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {drill.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {drill.steps.length} {t.steps}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <DrillDetailDialog
                drill={selectedDrill}
                isOpen={!!selectedDrill}
                onClose={() => setSelectedDrill(null)}
            />
        </div>
    )
}
