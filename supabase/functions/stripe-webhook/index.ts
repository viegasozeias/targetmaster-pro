import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const body = await req.text()
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')

        if (!webhookSecret) {
            throw new Error('Webhook secret not configured')
        }

        let event
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`Event received: ${event.type}`)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.supabase_uid
                const customerId = session.customer

                if (userId) {
                    console.log(`Updating subscription for user ${userId} to PRO`)
                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'pro',
                            subscription_status: 'active',
                            stripe_customer_id: customerId
                        })
                        .eq('id', userId)

                    if (error) console.error('Error updating profile:', error)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object
                const customerId = subscription.customer
                const status = subscription.status

                console.log(`Subscription updated for customer ${customerId}: ${status}`)

                // Find user by stripe_customer_id
                const { data: profiles } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)

                if (profiles && profiles.length > 0) {
                    const userId = profiles[0].id
                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: status
                        })
                        .eq('id', userId)
                    if (error) console.error('Error updating profile status:', error)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const customerId = subscription.customer

                console.log(`Subscription deleted for customer ${customerId}`)

                const { data: profiles } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)

                if (profiles && profiles.length > 0) {
                    const userId = profiles[0].id
                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                            subscription_status: 'canceled'
                        })
                        .eq('id', userId)
                    if (error) console.error('Error canceling subscription:', error)
                }
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
