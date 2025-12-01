import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDiagnosisStore } from "@/store/useDiagnosisStore"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"
import { Loader2 } from "lucide-react"
import { SubscriptionPlan } from "@/features/subscription/SubscriptionPlan"

export function ProfilePage() {
    const { data, saveProfile, fetchProfile, isLoading } = useDiagnosisStore()
    const { language } = useLanguageStore()
    const t = translations[language].diagnosis
    const tApp = translations[language].app

    useEffect(() => {
        fetchProfile()

        // Handle hash scrolling
        if (window.location.hash === '#plans') {
            setTimeout(() => {
                const element = document.getElementById('plans')
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
            }, 100) // Small delay to ensure render
        }
    }, [])

    const diagnosisSchema = z.object({
        handedness: z.enum(["right", "left"]),
        eyeDominance: z.enum(["right", "left"]),
        visionIssues: z.string().optional(),
        medications: z.string().optional(),
        physicalLimitations: z.string().optional(),
        firearmModel: z.string().min(2, {
            message: t.errors.firearmModel,
        }),
        caliber: z.string().min(1, {
            message: t.errors.caliber,
        }),
        shootingExperience: z.string().min(1, {
            message: t.errors.experience,
        }),
        shootingFrequency: z.string().min(1, {
            message: t.errors.frequency,
        }),
    })

    const form = useForm<z.infer<typeof diagnosisSchema>>({
        resolver: zodResolver(diagnosisSchema),
        defaultValues: {
            handedness: "right",
            eyeDominance: "right",
            visionIssues: "",
            medications: "",
            physicalLimitations: "",
            firearmModel: "",
            caliber: "",
            shootingExperience: "",
            shootingFrequency: "",
        },
    })

    // Update form when data loads
    useEffect(() => {
        if (data) {
            form.reset(data)
        }
    }, [data, form])

    // Reset form validation when language changes
    useEffect(() => {
        form.trigger()
    }, [language, form])

    async function onSubmit(values: z.infer<typeof diagnosisSchema>) {
        await saveProfile(values as any)
        alert("Profile updated successfully!")
    }

    if (isLoading && !data) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>{t.title}</CardTitle>
                    <CardDescription>
                        {t.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="handedness"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.handedness}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.select} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="right">{t.right}</SelectItem>
                                                    <SelectItem value="left">{t.left}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="eyeDominance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.eyeDominance}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.select} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="right">{t.right}</SelectItem>
                                                    <SelectItem value="left">{t.left}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="visionIssues"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.visionIssues}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t.visionPlaceholder} {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {t.visionDesc}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="medications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.medications}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t.medicationsPlaceholder}
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="physicalLimitations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.physicalLimitations}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t.physicalPlaceholder}
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firearmModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.firearmModel}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t.firearmPlaceholder} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="caliber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.caliber}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t.caliberPlaceholder} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="shootingExperience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.experience}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.select} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="beginner">{t.beginner}</SelectItem>
                                                    <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                                                    <SelectItem value="advanced">{t.advanced}</SelectItem>
                                                    <SelectItem value="professional">{t.professional}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shootingFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.frequency}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.select} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="weekly">{t.weekly}</SelectItem>
                                                    <SelectItem value="monthly">{t.monthly}</SelectItem>
                                                    <SelectItem value="occasional">{t.occasional}</SelectItem>
                                                    <SelectItem value="rare">{t.rare}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tApp.saveProfile}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div id="plans" className="max-w-4xl mx-auto scroll-mt-20">
                <h2 className="text-2xl font-bold tracking-tight mb-4 text-center">
                    {language === 'pt' ? 'Seu Plano' : 'Your Plan'}
                </h2>
                <SubscriptionPlan />
            </div>
        </div>
    )
}
