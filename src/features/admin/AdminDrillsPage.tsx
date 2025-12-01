import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Drill } from "@/store/useDrillsStore"

export function AdminDrillsPage() {
    const [drills, setDrills] = useState<Drill[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)

    useEffect(() => {
        fetchDrills()
    }, [])

    async function fetchDrills() {
        try {
            const { data, error } = await supabase
                .from('drills')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDrills(data as Drill[])
        } catch (error) {
            console.error('Error fetching drills:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this drill?")) return

        try {
            const { error } = await supabase
                .from('drills')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDrills(drills.filter(d => d.id !== id))
        } catch (error) {
            console.error('Error deleting drill:', error)
            alert("Failed to delete drill")
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        const stepsString = formData.get('steps') as string
        const steps = stepsString.split('\n').filter(s => s.trim())

        const newDrill = {
            title: formData.get('title'),
            description: formData.get('description'),
            difficulty: formData.get('difficulty'),
            category: formData.get('category'),
            steps: steps
        }

        try {
            const { data, error } = await supabase
                .from('drills')
                .insert([newDrill])
                .select()
                .single()

            if (error) throw error

            setDrills([data as Drill, ...drills])
            setIsAddOpen(false)
        } catch (error) {
            console.error('Error adding drill:', error)
            alert("Failed to add drill")
        }
    }

    if (isLoading) return <div>Loading drills...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Drills Management</h1>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Drill</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Drill</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input name="title" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <Select name="difficulty" required defaultValue="beginner">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select name="category" required defaultValue="accuracy">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="accuracy">Accuracy</SelectItem>
                                                <SelectItem value="speed">Speed</SelectItem>
                                                <SelectItem value="manipulation">Manipulation</SelectItem>
                                                <SelectItem value="mixed">Mixed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Steps (One per line)</Label>
                                    <Textarea name="steps" required className="h-32" placeholder="Step 1&#10;Step 2&#10;Step 3" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create Drill</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Steps</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drills.map((drill) => (
                            <TableRow key={drill.id}>
                                <TableCell className="font-medium">{drill.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{drill.category}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={drill.difficulty === 'beginner' ? 'secondary' : drill.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                                        {drill.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell>{drill.steps.length} steps</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(drill.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
