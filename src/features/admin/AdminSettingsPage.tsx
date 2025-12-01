import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"

export function AdminSettingsPage() {
    const [apiKey, setApiKey] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchConfig()
    }, [])

    async function fetchConfig() {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'google_gemini_api_key')
                .single()

            if (error) throw error
            if (data) setApiKey(data.value || "")
        } catch (error) {
            console.error('Error fetching config:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('system_config')
                .upsert({
                    key: 'google_gemini_api_key',
                    value: apiKey,
                    description: 'API Key for Google Gemini AI'
                })

            if (error) throw error
            alert("Settings saved successfully!")
        } catch (error) {
            console.error('Error saving config:', error)
            alert("Failed to save settings.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>AI Configuration</CardTitle>
                    <CardDescription>
                        Manage the API keys used for AI analysis features.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">Google Gemini API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter API Key"
                            />
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This key will be used for all users to generate AI analysis reports.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
