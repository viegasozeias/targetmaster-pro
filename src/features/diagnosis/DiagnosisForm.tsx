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
import { useEffect } from "react"

export function DiagnosisForm() {
    const setData = useDiagnosisStore((state) => state.setData)
    const { language } = useLanguageStore()
    const t = translations[language].diagnosis
    const tApp = translations[language].app

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
            visionIssues: "",
            medications: "",
            physicalLimitations: "",
            firearmModel: "",
            caliber: "",
            shootingExperience: "",
            shootingFrequency: "",
        },
    })

    // Reset form validation when language changes to update error messages
    useEffect(() => {
        form.trigger()
    }, [language, form])

    function onSubmit(values: z.infer<typeof diagnosisSchema>) {
        console.log(values)
        setData(values as any)
        // alert("Diagnosis data saved! Ready for target analysis.")
    }

    return (
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        <Button type="submit" className="w-full">{tApp.saveProfile}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
