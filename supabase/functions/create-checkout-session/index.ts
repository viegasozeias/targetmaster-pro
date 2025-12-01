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

    try {
        console.log('Function invoked')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            console.error('User not authenticated')
            throw new Error('User not authenticated')
        }
        console.log('User found:', user.id)

        const { priceId } = await req.json()
        console.log('Price ID received:', priceId)

        if (!priceId) {
            throw new Error('Price ID is required')
        }

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeKey) {
            console.error('Stripe Secret Key is missing')
            throw new Error('Stripe configuration error')
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Get or create customer
        let customerId = user.user_metadata.stripe_customer_id
        console.log('Existing customer ID:', customerId)

        if (!customerId) {
            console.log('Creating new Stripe customer')
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_uid: user.id
                }
            })
            customerId = customer.id
            console.log('Created customer ID:', customerId)
        }

        console.log('Creating checkout session...')
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/admin?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/admin/settings`,
            customer_update: {
                address: 'auto'
            },
            metadata: {
                supabase_uid: user.id
            }
        })
        console.log('Session created:', session.id)

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in create-checkout-session:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
