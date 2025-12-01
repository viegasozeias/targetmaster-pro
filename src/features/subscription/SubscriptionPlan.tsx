import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/stripe"
import { useAuthStore } from "@/store/useAuthStore"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function SubscriptionPlan() {
    const { profile } = useAuthStore()
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            if (SUBSCRIPTION_PLANS.PRO.priceId.startsWith('price_1Q...')) {
                alert("Configuração incompleta: Você precisa adicionar o ID do Preço do Stripe em src/lib/stripe.ts")
                return
            }

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId: SUBSCRIPTION_PLANS.PRO.priceId
                }
            })

            if (error) throw error

            if (data?.url) {
                window.location.href = data.url
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (error: any) {
            console.error("Error:", error)
            alert(`Erro ao iniciar checkout: ${error.message || 'Tente novamente'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session')
            if (error) throw error
            if (data?.url) {
                window.location.href = data.url
            } else {
                throw new Error('No portal URL returned')
            }
        } catch (error: any) {
            console.error("Error:", error)
            alert(`Erro ao abrir portal: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const isPro = profile?.subscription_tier === 'pro'

    return (
        <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className={isPro ? "border-muted" : "border-primary shadow-lg"}>
                <CardHeader>
                    <CardTitle>{SUBSCRIPTION_PLANS.FREE.name}</CardTitle>
                    <CardDescription>Para iniciantes no tiro esportivo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold mb-6">
                        {formatPrice(SUBSCRIPTION_PLANS.FREE.price)}
                        <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {SUBSCRIPTION_PLANS.FREE.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant="outline" disabled={!isPro}>
                        {isPro ? "Downgrade" : "Plano Atual"}
                    </Button>
                </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className={isPro ? "border-primary shadow-lg" : "border-muted"}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {SUBSCRIPTION_PLANS.PRO.name}
                        {!isPro && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Recomendado</span>}
                    </CardTitle>
                    <CardDescription>Para atiradores que buscam evolução rápida</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold mb-6">
                        {formatPrice(SUBSCRIPTION_PLANS.PRO.price)}
                        <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {SUBSCRIPTION_PLANS.PRO.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    {isPro ? (
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleManageSubscription}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gerenciar Assinatura
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={handleSubscribe}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assinar Pro
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
